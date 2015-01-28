package ami.com.elcaminodelinca;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;

/**
 * Created by Denny on 29/11/2014.
 */
public class Init extends Activity {

    int TIME = 2000; // Two seconds
    private SessionDataSource dataSource;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.init);
        dataSource = new SessionDataSource(this);
        dataSource.open();
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
        if(dataSource.validateSession()){
            finish();
            Intent code = new Intent(getApplicationContext(), Game.class);
            startActivity(code);
        }else{
            finish();
            Intent main = new Intent(getApplicationContext(),Login.class);
            startActivity(main);
        }
    }
}
