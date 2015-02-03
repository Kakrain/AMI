package ami.com.elcaminodelinca;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;

/**
 * Created by Denny on 08/01/2015.
 */

public class SettingsDataSource {
    private SQLiteDatabase database;
    private SettingsHelper dbHelper;
    private String[] allColumns = { SettingsHelper.COLUMN_SENSITIVITY };

    public SettingsDataSource(Context context) {
        dbHelper = new SettingsHelper(context);
    }

    public void open() throws SQLException {
        database = dbHelper.getWritableDatabase();
    }

    public void close() {
        dbHelper.close();
    }

    public void setSensitivity(int value) {
        database.delete(SettingsHelper.TABLE_SETTINGS,null, null);
        ContentValues values = new ContentValues();
        values.put(SettingsHelper.COLUMN_SENSITIVITY,value);
        database.insert(SettingsHelper.TABLE_SETTINGS, null, values);
    }

    public int getSensitivity(){
        Cursor cursor = database.rawQuery("select * from " + SettingsHelper.TABLE_SETTINGS,null);
        cursor.moveToFirst();
        if(cursor.getCount()>0)
            return (int) cursor.getFloat(0);
        return 0;
    }

}
