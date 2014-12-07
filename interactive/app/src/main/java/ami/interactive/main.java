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


public class main extends Activity implements SensorEventListener {

    Socket socket;
    TableLayout controls;
    Switch onoff;
    TextView message;
    Boolean screenTouched = false;
    Button b11, b12, b13, b21, b22, b23, b31, b32, b33;

    private SensorManager mSensorManager;
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

        controls = (TableLayout) findViewById(R.id.controls);
        onoff = (Switch) findViewById(R.id.onoff);
        message = (TextView) findViewById(R.id.message);
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

        controls.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if(motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    screenTouched = true;
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    screenTouched = false;
                }
                return false;
            }
        });
        onoff.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isOn) {
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
    }

    public void socketIOSetUp(){
        try {
            socket = IO.socket("http://192.168.137.150:3000");
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
                    if(screenTouched) {
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
        mSensorManager.registerListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), mSensorManager.SENSOR_DELAY_NORMAL);
        mSensorManager.registerListener(this, mSensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE), mSensorManager.SENSOR_DELAY_NORMAL);
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
