package ami.com.elcaminodelinca;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

/**
 * Created by Denny on 08/01/2015.
 */

public class SettingsHelper extends SQLiteOpenHelper {

    public static final String TABLE_SETTINGS = "settings";
    public static final String COLUMN_SENSITIVITY = "sensitivity";

    private static final String DATABASE_NAME = "settings.db";
    private static final int DATABASE_VERSION = 1;

    private static final String DATABASE_CREATE = "create table "
            + TABLE_SETTINGS + "(" + COLUMN_SENSITIVITY + " real not null" + ");";

    public SettingsHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase database) {
        database.execSQL(DATABASE_CREATE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.w(SettingsHelper.class.getName(),
                "Upgrading database from version " + oldVersion + " to "
                        + newVersion + ", which will destroy all old data");
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SETTINGS);
        onCreate(db);
    }

}