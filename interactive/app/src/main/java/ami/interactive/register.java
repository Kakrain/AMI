package ami.interactive;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
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

/**
 * Created by Denny on 30/12/2014.
 */
public class register extends Activity {

    @InjectView(R.id.register_email) EditText email;
    @InjectView(R.id.register_password) EditText password;
    @InjectView(R.id.register_confirm_password) EditText confirm_password;
    Socket socket;
    Boolean connected = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.register);
        getActionBar().setDisplayHomeAsUpEnabled(true);
        socketIOSetUp();
        ButterKnife.inject(this);
    }

    public void socketIOSetUp(){
        try {
            socket = IO.socket("http://192.168.0.3:3000");
        } catch (URISyntaxException e) {
            System.out.println("ERROR: " + e);
        }
        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                connected = true;
                System.out.println("CONNECTED FOR REGISTER");
            }
        });
        socket.on("registration-response", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                socket.disconnect();
                System.out.println("DISCONNECTED FROM REGISTER");
                finish();
                Intent code = new Intent(getApplicationContext(), game.class);
                startActivity(code);
            }
        });
        socket.on("registration-response-no", new Emitter.Listener() {
            @Override
            public void call(Object... args) {
                CharSequence text = args[0].toString();
                Toast toast = Toast.makeText(getApplicationContext(), text, Toast.LENGTH_SHORT);
                toast.show();
            }
        });
        socket.connect();
    }

    @OnClick({R.id.register_enter})
    public void action(Button button) {
        if(connected) {
            try {
                String email_string = email.getText().toString();
                String password_string = password.getText().toString();
                String confirm_password_string = confirm_password.getText().toString();
                if(!password_string.equals(confirm_password_string)){
                    Context context = getApplicationContext();
                    CharSequence text = "Las contraseñas no coinciden.";
                    Toast toast = Toast.makeText(context,text, Toast.LENGTH_SHORT);
                    toast.show();
                }else{
                    JSONObject user = new JSONObject();
                    user.put("email", email_string);
                    user.put("password", password_string);
                    socket.emit("registration-request", user);
                }
            }catch(Exception e){}
        }else {
            socket.connect();
            Context context = getApplicationContext();
            CharSequence text = "Problema de conexión a Internet. Vuelva a intentarlo más tarde.";
            Toast toast = Toast.makeText(context,text, Toast.LENGTH_SHORT);
            toast.show();
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                Intent login = new Intent(this,login.class);
                startActivity(login);
                return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
