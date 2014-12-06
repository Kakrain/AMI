package ami.interactive;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;

/**
 * Created by Denny on 29/11/2014.
 */
public class init extends Activity {

    int TIME = 2000; // Two seconds

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.init);
        check();
    }

    public void check(){
        Thread thread = new Thread(new Runnable(){
            public void run(){
                try{
                    Thread.sleep(TIME);
                    loadMain();
                }catch(Exception ex){
                    ex.printStackTrace();
                }
            }
        });
        thread.start();
    }

    public void loadMain(){
        finish();
        Intent main = new Intent(this,main.class);
        startActivity(main);
    }
}
