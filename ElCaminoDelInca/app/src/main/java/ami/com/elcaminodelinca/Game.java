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
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TableLayout;
import android.widget.TextView;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;

import butterknife.ButterKnife;
import butterknife.InjectView;
import butterknife.OnCheckedChanged;
import butterknife.OnClick;


public class Game extends ActionBarActivity implements SensorEventListener, NavigationDrawerFragment.NavigationDrawerCallbacks {

    TextView game_message;
    @InjectView(R.id.game_code) EditText game_code;
    @InjectView(R.id.game_controls) TableLayout game_controls;
    @InjectView(R.id.game_move_nw) Button moveNw;
    @InjectView(R.id.game_move_forward) Button moveForward;
    @InjectView(R.id.game_move_no) Button moveNo;
    @InjectView(R.id.game_move_left) Button moveLeft;
    @InjectView(R.id.game_move_camera) Button camera;
    @InjectView(R.id.game_move_right) Button moveRight;
    @InjectView(R.id.game_move_sw) Button moveSw;
    @InjectView(R.id.game_move_backward) Button moveBackward;
    @InjectView(R.id.game_move_so) Button moveSo;

    String code;
    Socket socket, namespace;
    Boolean namespaceConected = false;
    Boolean moveCamera = false;
    Boolean moveWeapon = false;
    SensorManager mSensorManager;
    float mLastX, mLastY, mLastZ;
    boolean mInitialized = false;
    final float NOISE = (float) 18.0;
    Animation fadeIn = null;
    Animation fadeOut = null;
    private NavigationDrawerFragment mNavigationDrawerFragment;
    private CharSequence mTitle;
    private SessionDataSource dataSource;
    private SettingsDataSource settingsSource;
    //private MenuItem sensibilidad;


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

        moveNw.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-forward-down");
                    namespace.emit("move-left-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-forward-up");
                    namespace.emit("move-left-up");
                }
                return false;
            }
        });
        moveForward.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-forward-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-forward-up");
                }
                return false;
            }
        });
        moveNo.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-forward-down");
                    namespace.emit("move-right-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-forward-up");
                    namespace.emit("move-right-up");
                }
                return false;
            }
        });
        moveLeft.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-left-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-left-up");
                }
                return false;
            }
        });
        camera.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) { moveCamera = true; }
                else if (motionEvent.getAction() == MotionEvent.ACTION_UP) { moveCamera = false; }
                return false;
            }
        });
        moveRight.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-right-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-right-up");
                }
                return false;
            }
        });
        moveSw.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-backward-down");
                    namespace.emit("move-left-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-backward-up");
                    namespace.emit("move-left-up");
                }
                return false;
            }
        });
        moveBackward.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-backward-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-backward-up");
                }
                return false;
            }
        });
        moveSo.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                if (motionEvent.getAction() == MotionEvent.ACTION_DOWN) {
                    moveCamera = true;
                    namespace.emit("move-backward-down");
                    namespace.emit("move-right-down");
                } else if (motionEvent.getAction() == MotionEvent.ACTION_UP) {
                    moveCamera = false;
                    namespace.emit("move-backward-up");
                    namespace.emit("move-right-up");
                }
                return false;
            }
        });

        dataSource = new SessionDataSource(this);
        dataSource.open();
        settingsSource = new SettingsDataSource(this);
        settingsSource.open();
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

    @OnCheckedChanged(R.id.game_switch)
    public void switchAction(boolean isOn){
        if (isOn) {
            namespace.emit("resume-game");
            game_message.startAnimation(fadeOut);
            game_message.setVisibility(View.GONE);
            game_controls.startAnimation(fadeIn);
            game_controls.setVisibility(View.VISIBLE);
            mNavigationDrawerFragment.setMenuVisibility(true);
            mNavigationDrawerFragment.setUserVisibleHint(true);
            //sensibilidad.setEnabled(true);
        } else {
            namespace.emit("pause-game");
            game_controls.startAnimation(fadeOut);
            game_controls.setVisibility(View.GONE);
            game_message.startAnimation(fadeIn);
            game_message.setVisibility(View.VISIBLE);
            mNavigationDrawerFragment.setMenuVisibility(false);
            mNavigationDrawerFragment.setUserVisibleHint(false);
            //sensibilidad.setEnabled(false);
        }
    }

    @OnClick(R.id.game_code_button)
    public void click(){
        code = game_code.getText().toString();
        if(code.length()==5) {
            socket.emit("temporal-mobile",code);
        }
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
                        if (deltaY > deltaX) {
                            if(namespaceConected) {
                                namespace.emit("attack");
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
                    break;
                case Sensor.TYPE_GYROSCOPE:
                    if(moveCamera) {
                        namespace.emit("camera-rotation-x",Float.toString(event.values[0]));
                        namespace.emit("camera-rotation-y",Float.toString(event.values[2]));
                    } else if(moveWeapon){

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
        onSectionAttached(position+1);
    }

    public void onSectionAttached(int number) {
        switch (number) {
            case 1:
                mTitle = getString(R.string.app_name);
                try {
                    getActionBar().setTitle(mTitle);
                }catch(Exception e){}
                break;
            case 2:
                mTitle = getString(R.string.title_section2);
                try {
                    getActionBar().setTitle(mTitle);
                }catch(Exception e){}
                break;
            case 3:
                mTitle = getString(R.string.title_section3);
                try {
                    getActionBar().setTitle(mTitle);
                }catch(Exception e){}
                break;
            case 4:
                mTitle = getString(R.string.title_section4);
                try {
                    getActionBar().setTitle(mTitle);
                }catch(Exception e){}
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

            /*sensibilidad = menu.getItem(0);
            if(namespace == null)
                sensibilidad.setEnabled(false);*/

            return true;
        }
        return super.onCreateOptionsMenu(menu);
    }

    /*@Override
    public boolean onPrepareOptionsMenu (Menu menu) {
        try {

        }catch(Exception e){}
        return true;
    }*/

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
            /*case R.id.action_sensitivity:
                sensitiveSeekBar();
                break;*/
        }
        return super.onOptionsItemSelected(item);
    }

    public void sensitiveSeekBar() {
        final AlertDialog.Builder popDialog = new AlertDialog.Builder(this);
        final SeekBar seek = new SeekBar(this);
        seek.setMinimumHeight(30);
        seek.setMax(100);
        seek.setProgress(settingsSource.getSensitivity());
        popDialog.setIcon(android.R.drawable.ic_menu_manage);
        popDialog.setTitle("Ajuste de Sensibilidad");
        popDialog.setView(seek);

        seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser){
                settingsSource.setSensitivity(progress);
            }
            public void onStartTrackingTouch(SeekBar arg0) {}
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        popDialog.setPositiveButton("Listo",new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });
        popDialog.create();
        popDialog.show();
    }

    /*public float mapSensitivity(int progress){
        if(progress < 50){}
        else {}
    }*/

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
