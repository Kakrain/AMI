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
import android.widget.LinearLayout;
import android.widget.TableLayout;
import android.widget.TextView;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;


public class main extends Activity implements SensorEventListener {

    Socket socket;
    LinearLayout layout;
    TableLayout table;
    TextView tap;
    Boolean playing = false;
    Button b11, b12, b13, b21, b22, b23, b31, b32, b33;

    private SensorManager mSensorManager;
    private Sensor mAccelerometer;
    private float mLastX, mLastY, mLastZ;
    boolean mInitialized = false;
    private final float NOISE = (float) 18.0;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.main);

        final Animation fadeIn = AnimationUtils.loadAnimation(this,R.anim.fade_in);
        final Animation fadeOut = AnimationUtils.loadAnimation(this,R.anim.fade_out);

        tap = (TextView) findViewById(R.id.tap);
        table = (TableLayout) findViewById(R.id.table);
        b11 = (Button) findViewById(R.id.b11);
        b12 = (Button) findViewById(R.id.b12);
        b13 = (Button) findViewById(R.id.b13);
        b21 = (Button) findViewById(R.id.b21);
        b22 = (Button) findViewById(R.id.b22);
        b23 = (Button) findViewById(R.id.b23);
        b31 = (Button) findViewById(R.id.b31);
        b32 = (Button) findViewById(R.id.b32);
        b33 = (Button) findViewById(R.id.b33);

        socketIOSetUp();

        layout = (LinearLayout) findViewById(R.id.linearlayout);
        layout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (socket.connected()) {
                    if (!playing) {
                        socket.emit("enable-game");
                        tap.startAnimation(fadeOut);
                        tap.setVisibility(View.GONE);
                        table.startAnimation(fadeIn);
                        table.setVisibility(View.VISIBLE);
                        playing = true;
                    } else {
                        socket.emit("disable-game");
                        table.startAnimation(fadeOut);
                        table.setVisibility(View.GONE);
                        tap.startAnimation(fadeIn);
                        tap.setVisibility(View.VISIBLE);
                        playing = false;
                    }
                }
            }
        });

        b12.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    socket.emit("b12-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    socket.emit("b12-up");
                }
                return false;
            }
        });
        b21.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    socket.emit("b21-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    socket.emit("b21-up");
                }
                return false;
            }
        });
        b23.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    socket.emit("b23-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    socket.emit("b23-up");
                }
                return false;
            }
        });
        b32.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    socket.emit("b32-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    socket.emit("b32-up");
                }
                return false;
            }
        });

        mSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        mAccelerometer = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
    }

    public void socketIOSetUp(){
        try {
            socket = IO.socket("http://192.168.0.2:3000");
        } catch (URISyntaxException e) { e.printStackTrace(); }
        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
            }
        }).on(Socket.EVENT_CONNECT_ERROR, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
            }
        }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
            }
        });
        socket.connect();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
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
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {}

    protected void onResume() {
        super.onResume();
        mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
    }

    protected void onPause() {
        super.onPause();
        mSensorManager.unregisterListener(this);
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
