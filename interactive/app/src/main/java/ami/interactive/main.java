package ami.interactive;

import android.app.Activity;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.AccelerateInterpolator;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.view.animation.DecelerateInterpolator;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.LinearLayout;
import android.widget.Switch;
import android.widget.TableLayout;
import android.widget.TextView;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import org.w3c.dom.Text;

import java.net.URISyntaxException;

import butterknife.ButterKnife;
import butterknife.InjectView;
import butterknife.OnCheckedChanged;
import butterknife.OnTouch;


public class main extends Activity implements SensorEventListener {

    @InjectView(R.id.controls) TableLayout controls;
    @InjectView(R.id.message)  TextView message;
    @InjectView(R.id.onoff)    Switch onoff;
    @InjectView(R.id.b12)      Button b12;
    @InjectView(R.id.b21)      Button b21;
    @InjectView(R.id.b22)      Button b22;
    @InjectView(R.id.b23)      Button b23;
    @InjectView(R.id.b32)      Button b32;

    Socket socket;
    Boolean moveCamera = false;
    SensorManager mSensorManager;
    float mLastX, mLastY, mLastZ;
    boolean mInitialized = false;
    final float NOISE = (float) 18.0;
    Animation fadeIn = null;
    Animation fadeOut = null;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.main);

        fadeIn = AnimationUtils.loadAnimation(this,R.anim.fade_in);
        fadeOut = AnimationUtils.loadAnimation(this,R.anim.fade_out);

        ButterKnife.inject(this);
        socketIOSetUp();

        mSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
    }

    @OnCheckedChanged(R.id.onoff)
    public void switchAction(boolean isOn){
        if (isOn) {
            socket.emit("enable-game");
            message.startAnimation(fadeOut);
            message.setVisibility(View.GONE);
            controls.startAnimation(fadeIn);
            controls.setVisibility(View.VISIBLE);
        } else {
            socket.emit("disable-game");
            controls.startAnimation(fadeOut);
            controls.setVisibility(View.GONE);
            message.startAnimation(fadeIn);
            message.setVisibility(View.VISIBLE);
        }
    }

    @OnTouch({R.id.b12, R.id.b21, R.id.b22, R.id.b23, R.id.b32})
    public boolean move(Button button, MotionEvent motionEvent){
        switch(button.getId()){
            case R.id.b12:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("b12-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("b12-up"); }
                break;
            case R.id.b21:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("b21-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("b21-up"); }
                break;
            case R.id.b22:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { moveCamera = true; }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { moveCamera = false; }
                break;
            case R.id.b23:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("b23-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("b23-up"); }
                break;
            case R.id.b32:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("b32-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("b32-up"); }
                break;
        }
        return true;
    }

    public void socketIOSetUp(){
        try {
            socket = IO.socket("http://192.168.0.5:3000");
        } catch (URISyntaxException e) { e.printStackTrace(); }
        socket.connect();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        synchronized (this) {
            switch (event.sensor.getType()){
                case Sensor.TYPE_ACCELEROMETER:
                    float x = event.values[0];
                    float y = event.values[1];
                    float z = event.values[2];
                    if (!mInitialized) {
                        mLastX = x;
                        mLastY = y;
                        mLastZ = z;
                        mInitialized = true;
                    } else {
                        float deltaX = Math.abs(mLastX - x);
                        float deltaY = Math.abs(mLastY - y);
                        float deltaZ = Math.abs(mLastZ - z);
                        if (deltaX < NOISE) deltaX = (float)0.0;
                        if (deltaY < NOISE) deltaY = (float)0.0;
                        if (deltaZ < NOISE) deltaZ = (float)0.0;
                        mLastX = x;
                        mLastY = y;
                        mLastZ = z;
                        if (deltaX > deltaY) {
                            if(socket.connected())
                                socket.emit("attack");
                        }
                        if (deltaZ > deltaY) {
                            if (socket.connected())
                                socket.emit("block");
                        }
                    }
                    break;
                case Sensor.TYPE_GYROSCOPE:
                    if(moveCamera) {
                        System.out.println("x:" + Float.toString(event.values[0]));
                        System.out.println("y:" + Float.toString(event.values[1]));
                        System.out.println("z:" + Float.toString(event.values[2]));
                    }
                    break;
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {}

    @Override
    protected void onResume() {
        super.onResume();
        mSensorManager.registerListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), mSensorManager.SENSOR_DELAY_GAME);
        mSensorManager.registerListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE), mSensorManager.SENSOR_DELAY_GAME);
    }

    protected void onPause() {
        super.onPause();
        mSensorManager.unregisterListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER));
        mSensorManager.unregisterListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE));
    }

    @Override
    protected void onStop() {
        super.onStop();
        mSensorManager.unregisterListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER));
        mSensorManager.unregisterListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE));
    }

    @Override
    protected  void onDestroy(){
        super.onDestroy();
        ButterKnife.reset(this);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
