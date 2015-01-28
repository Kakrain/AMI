package ami.com.elcaminodelinca;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.Html;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import org.json.JSONObject;

import java.net.URISyntaxException;

import butterknife.ButterKnife;
import butterknife.InjectView;
import butterknife.OnClick;

public class Login extends Activity {

    @InjectView(R.id.login_email)
    EditText email;
    @InjectView(R.id.login_password)
    EditText password;
    @InjectView(R.id.login_enter)
    Button enter;
    @InjectView(R.id.login_register)
    Button register;

    Socket socket;
    Boolean connected = false;
    private SessionDataSource dataSource;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login);
        socketIOSetUp();
        ButterKnife.inject(this);
        dataSource = new SessionDataSource(this);
        dataSource.open();
        register.setText(Html.fromHtml(getString(R.string.login_register)));
    }

    public void socketIOSetUp(){
        try {
            socket = IO.socket(IP.ip + ":3000");
        } catch (URISyntaxException e) {
            System.out.println("ERROR: " + e);
        }
        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                connected = true;
                System.out.println("CONNECTED");
            }
        });
        socket.on("validation-response", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                socket.disconnect();
                dataSource.openSession();
                finish();
                Intent code = new Intent(getApplicationContext(), Game.class);
                startActivity(code);
            }
        });
        socket.on("validation-response-no", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                CharSequence text = args[0].toString();
                Toast toast = Toast.makeText(getApplicationContext(), text, Toast.LENGTH_SHORT);
                toast.show();
            }
        }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                connected = false;
                System.out.println("DISCONNECTED");
            }
        });
        socket.connect();
    }

    @OnClick({R.id.login_enter, R.id.login_register})
    public void action(Button button) {
        switch(button.getId()){
            case R.id.login_enter:
                if(connected) {
                    try {
                        String email_string = email.getText().toString();
                        String password_string = password.getText().toString();
                        JSONObject user = new JSONObject();
                        user.put("email", email_string);
                        user.put("password", password_string);
                        socket.emit("validation-request", user);
                    }catch(Exception e){}
                }else {
                    socket.connect();
                    Context context = getApplicationContext();
                    CharSequence text = "Problema de conexión a Internet. Vuelva a intentarlo más tarde.";
                    Toast toast = Toast.makeText(context, text, Toast.LENGTH_SHORT);
                    toast.show();
                }
                break;
            case R.id.login_register:
                socket.disconnect();
                finish();
                Intent register = new Intent(this,Register.class);
                startActivity(register);
                break;
        }
    }

    @Override
    protected  void onDestroy(){
        super.onDestroy();
        ButterKnife.reset(this);
    }

}
