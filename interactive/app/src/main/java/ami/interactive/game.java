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
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Switch;
import android.widget.TableLayout;
import android.widget.TextView;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;

import butterknife.ButterKnife;
import butterknife.InjectView;
import butterknife.OnCheckedChanged;
import butterknife.OnTouch;


public class game extends Activity implements SensorEventListener {

    @InjectView(R.id.game_code) EditText game_code;
    @InjectView(R.id.game_controls) TableLayout game_controls;
    @InjectView(R.id.game_message) TextView game_message;
    @InjectView(R.id.game_switch) Switch game_switch;

    String code;
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

        setContentView(R.layout.login);

        fadeIn = AnimationUtils.loadAnimation(this,R.anim.fade_in);
        fadeOut = AnimationUtils.loadAnimation(this,R.anim.fade_out);

        ButterKnife.inject(this);

        mSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
    }

    public void socketIOSetUp(String ip, String matchCode, String port){
        try {
            socket = IO.socket("http://" + ip + "/" + matchCode +":" + port);
        } catch (URISyntaxException e) { e.printStackTrace(); }
        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                socket.emit("temporal-mobile",code);
            }
        }).on("match-correct", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                LinearLayout game_match = (LinearLayout) findViewById(R.id.game_match);
                game_match.startAnimation(fadeOut);
                game_match.setVisibility(View.GONE);
                game_message.startAnimation(fadeIn);
                game_message.setVisibility(View.VISIBLE);
            }
        }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {}
        });
        socket.connect();
    }

    @OnCheckedChanged(R.id.game_switch)
    public void switchAction(boolean isOn){
        if (isOn) {
            socket.emit("resume-game");
            game_message.startAnimation(fadeOut);
            game_message.setVisibility(View.GONE);
            game_controls.startAnimation(fadeIn);
            game_controls.setVisibility(View.VISIBLE);
        } else {
            socket.emit("pause-game");
            game_controls.startAnimation(fadeOut);
            game_controls.setVisibility(View.GONE);
            game_message.startAnimation(fadeIn);
            game_message.setVisibility(View.VISIBLE);
        }
    }

    @OnTouch({R.id.game_move_forward, R.id.game_move_left, R.id.game_move_camera, R.id.game_move_right, R.id.game_move_backward, R.id.game_code_button})
    public boolean move(Button button, MotionEvent motionEvent){
        switch(button.getId()){
            case R.id.game_move_forward:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("move-forward-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("move-forward-up"); }
                break;
            case R.id.game_move_left:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("move-left-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("move-left-up"); }
                break;
            case R.id.game_move_camera:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { moveCamera = true; }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { moveCamera = false; }
                break;
            case R.id.game_move_right:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("move-right-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("move-right-up"); }
                break;
            case R.id.game_move_backward:
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) { socket.emit("move-backward-down"); }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { socket.emit("move-backward-up"); }
                break;
            case R.id.game_code_button:
                code = game_code.getText().toString();
                if(code.length()>5)
                    socketIOSetUp("192.168.137.150",code,"3000");
                break;
        }
        return true;
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
