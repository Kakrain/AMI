package ami.com.elcaminodelinca;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;

/**
 * Created by Denny on 08/01/2015.
 */

public class SessionDataSource {
    private SQLiteDatabase database;
    private SessionHelper dbHelper;
    private String[] allColumns = { SessionHelper.COLUMN_ACTIVE };

    public SessionDataSource(Context context) {
        dbHelper = new SessionHelper(context);
    }

    public void open() throws SQLException {
        database = dbHelper.getWritableDatabase();
    }

    public void close() {
        dbHelper.close();
    }

    public void openSession() {
        ContentValues values = new ContentValues();
        values.put(SessionHelper.COLUMN_ACTIVE,1);
        long insertId = database.insert(SessionHelper.TABLE_SESSION, null, values);
    }

    public void closeSession() {
        database.delete(SessionHelper.TABLE_SESSION,null, null);
    }

    public boolean validateSession(){
        Cursor cursor = database.rawQuery("select * from " + SessionHelper.TABLE_SESSION,null);
        if(cursor.getCount()==1)
            return true;
        return false;
    }

}
