package ami.com.elcaminodelinca;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TableLayout;
import android.widget.TextView;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;
import java.sql.SQLOutput;

import butterknife.ButterKnife;
import butterknife.InjectView;
import butterknife.InjectViews;
import butterknife.OnCheckedChanged;
import butterknife.OnClick;
import butterknife.OnTouch;


public class Game extends ActionBarActivity implements SensorEventListener, NavigationDrawerFragment.NavigationDrawerCallbacks {

    TextView game_message;
    @InjectView(R.id.game_code) EditText game_code;
    @InjectView(R.id.game_controls) TableLayout game_controls;
    @InjectView(R.id.game_attack) Button game_attack;

    String code;
    Socket socket, namespace;
    Boolean namespaceConected = false;
    Boolean moveCamera = false;
    Boolean moveWeapon = false;
    SensorManager mSensorManager;
    float mLastX, mLastY, mLastZ;
    boolean mInitialized = false;
    boolean mediaInit = true;
    final float NOISE = (float) 18.0;
    Animation fadeIn = null;
    Animation fadeOut = null;
    private NavigationDrawerFragment mNavigationDrawerFragment;
    private CharSequence mTitle;
    private SessionDataSource dataSource;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.game);

        mNavigationDrawerFragment = (NavigationDrawerFragment) getSupportFragmentManager().findFragmentById(R.id.navigation_drawer);
        mTitle = getTitle();

        mNavigationDrawerFragment.setUp(R.id.navigation_drawer,(DrawerLayout) findViewById(R.id.drawer_layout));
        mNavigationDrawerFragment.setMenuVisibility(false);
        mNavigationDrawerFragment.setUserVisibleHint(false);

        fadeIn = AnimationUtils.loadAnimation(this, R.anim.fade_in);
        fadeOut = AnimationUtils.loadAnimation(this, R.anim.fade_out);

        game_message = (TextView) findViewById(R.id.game_message);
        ButterKnife.inject(this);
        socketIOSetUp();

        mSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);

        dataSource = new SessionDataSource(this);
        dataSource.open();
    }

    public void socketIOSetUp(){
        try {
            socket = IO.socket(IP.ip+":"+IP.port);
        } catch (URISyntaxException e) { e.printStackTrace(); }
        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                System.out.println("CONNECTED TO GAME!");
            }
        }).on("match-correct", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                socket.disconnect();
                namespaceSetUp();
            }
        }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                System.out.println("SOCKET DISCONNECTED FROM GAME!");
            }
        });
        socket.connect();
    }

    public void namespaceSetUp(){
        try {
            namespace = IO.socket(IP.ip+":"+IP.port+"/"+code);
        }catch(Exception e){}
        namespace.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                System.out.println("CONNECTED TO CUSTOM NAMESPACE!");
                mSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
                namespaceConected = true;
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        LinearLayout game_match = (LinearLayout) findViewById(R.id.game_match);
                        game_match.startAnimation(fadeOut);
                        game_match.setVisibility(View.GONE);
                        game_message.startAnimation(fadeIn);
                        game_message.setVisibility(View.VISIBLE);
                    }
                });
            }
        }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                System.out.println("DISCONNECTED FROM CUSTOM ROOM!");
                namespaceConected = false;
            }
        });
        namespace.connect();
    }

    @OnTouch({
        R.id.game_move_forward_left,
        R.id.game_move_forward,
        R.id.game_move_forward_right,
        R.id.game_move_left,
        R.id.game_move_camera,
        R.id.game_move_right,
        R.id.game_move_backward_left,
        R.id.game_move_backward,
        R.id.game_move_backward_right})
    public boolean touckListener(View view, MotionEvent motionEvent){
        switch(view.getId()){
            case R.id.game_move_forward_left:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-forward-down");
                    namespace.emit("move-left-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-forward-up");
                    namespace.emit("move-left-up");
                }
                break;
            case R.id.game_move_forward:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-forward-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-forward-up");
                }
                break;
            case R.id.game_move_forward_right:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-forward-down");
                    namespace.emit("move-right-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-forward-up");
                    namespace.emit("move-right-up");
                }
                break;
            case R.id.game_move_left:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-left-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-left-up");
                }
                break;
            case R.id.game_move_camera:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) { moveCamera = true; }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { moveCamera = false; }
                break;
            case R.id.game_move_right:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-right-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-right-up");
                }
                break;
            case R.id.game_move_backward_left:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-backward-down");
                    namespace.emit("move-left-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-backward-up");
                    namespace.emit("move-left-up");
                }
                break;
            case R.id.game_move_backward:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-backward-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-backward-up");
                }
                break;
            case R.id.game_move_backward_right:
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-backward-down");
                    namespace.emit("move-right-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-backward-up");
                    namespace.emit("move-right-up");
                }
                break;
        }
        return false;
    }

    @OnCheckedChanged(R.id.game_switch)
    public void switchAction(boolean isOn){
        if (isOn) {
            namespace.emit("resume-game");
            if(mediaInit) {
                namespace.emit("mediaInit-disable");
                mediaInit = false;
            }
            game_message.startAnimation(fadeOut);
            game_message.setVisibility(View.GONE);
            game_controls.startAnimation(fadeIn);
            game_controls.setVisibility(View.VISIBLE);
            game_attack.startAnimation(fadeIn);
            game_attack.setVisibility(View.VISIBLE);
            mNavigationDrawerFragment.setMenuVisibility(true);
            mNavigationDrawerFragment.setUserVisibleHint(true);
        } else {
            namespace.emit("pause-game");
            game_controls.startAnimation(fadeOut);
            game_controls.setVisibility(View.GONE);
            game_attack.startAnimation(fadeOut);
            game_attack.setVisibility(View.GONE);
            game_message.startAnimation(fadeIn);
            game_message.setVisibility(View.VISIBLE);
            mNavigationDrawerFragment.setMenuVisibility(false);
            mNavigationDrawerFragment.setUserVisibleHint(false);
        }
    }

    @OnClick({R.id.game_code_button,R.id.game_attack})
    public void click(Button b){
        switch(b.getId()){
            case R.id.game_code_button:
                code = game_code.getText().toString();
                if(code.length()==5) {
                    socket.emit("temporal-mobile",code);
                }
                break;
            case R.id.game_attack:
                namespace.emit("attack");
                break;
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        synchronized (this) {
            switch (event.sensor.getType()){
                /*case Sensor.TYPE_ACCELEROMETER:
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
                        if (deltaY > deltaX) {
                            if(namespaceConected) {
                                namespace.emit("weapon-rotation-x",Float.toString(event.values[0]));
                                namespace.emit("weapon-rotation-y",Float.toString(event.values[2]));
                            }
                        } else {
                            if(namespaceConected) {
                                namespace.emit("weapon-rotation-x", Float.toString(event.values[0]));
                                namespace.emit("weapon-rotation-y", Float.toString(event.values[2]));
                            }
                        }
                    }
                    break;*/
                case Sensor.TYPE_GYROSCOPE:
                    try{
                        if(moveCamera) {
                            namespace.emit("camera-rotation-x", Float.toString(event.values[0]));
                            namespace.emit("camera-rotation-y", Float.toString(event.values[2]));
                        }
                    }catch(Exception e){
                        System.out.println("Error enviando datos de la cámara.");
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
    public void onNavigationDrawerItemSelected(int position) {
        onSectionAttached(position);
    }

    public void onSectionAttached(int number) {
        switch (number) {
            case 0:
                if(namespace != null)
                    namespace.emit("free-hand");
                break;
            case 1:
                if(namespace != null)
                    namespace.emit("spear");
                break;
        }
    }

    public void restoreActionBar() {
        ActionBar actionBar = getSupportActionBar();
        actionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_STANDARD);
        actionBar.setDisplayShowTitleEnabled(true);
        actionBar.setTitle(mTitle);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        if (!mNavigationDrawerFragment.isDrawerOpen()) {
            getMenuInflater().inflate(R.menu.home, menu);
            restoreActionBar();
            return true;
        }
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch(item.getItemId()){
            case R.id.action_exit:
                dataSource.closeSession();
                if(namespace != null) {
                    if (namespace.connected()) {
                        namespace.emit("close-room");
                        namespace.disconnect();
                        finish();
                        Intent main = new Intent(getApplicationContext(), Login.class);
                        startActivity(main);
                    }else {
                        finish();
                        Intent main = new Intent(getApplicationContext(), Login.class);
                        startActivity(main);
                    }
                }else{
                    finish();
                    Intent main = new Intent(getApplicationContext(), Login.class);
                    startActivity(main);
                }
                break;
        }
        return super.onOptionsItemSelected(item);
    }

    public static class PlaceholderFragment extends Fragment {
        private static final String ARG_SECTION_NUMBER = "section_number";
        public static PlaceholderFragment newInstance(int sectionNumber) {
            PlaceholderFragment fragment = new PlaceholderFragment();
            Bundle args = new Bundle();
            args.putInt(ARG_SECTION_NUMBER, sectionNumber);
            fragment.setArguments(args);
            return fragment;
        }
        public PlaceholderFragment() {}
        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,Bundle savedInstanceState) {
            View rootView = inflater.inflate(R.layout.game, container, false);
            return rootView;
        }
        @Override
        public void onAttach(Activity activity) {
            super.onAttach(activity);
            ((Game) activity).onSectionAttached(getArguments().getInt(ARG_SECTION_NUMBER));
        }
    }
}
