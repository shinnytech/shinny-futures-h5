package com.shinnytech.futures.ctpplugin;

import android.Manifest;
import android.content.pm.PackageManager;
import android.text.TextUtils;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.sfit.ctp.info.DeviceInfoManager;

@NativePlugin(
  permissions = {
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_COARSE_LOCATION,
    Manifest.permission.READ_PHONE_STATE
  }
)
public class CtpPlugin extends Plugin {
  public static final int REQUEST_COLLECT = 12345;
  private PluginCall call;

  @PluginMethod
  public void collect(PluginCall call) {
    this.call = call;
    if (hasRequiredPermissions()) {
      collectSystemInfo();
    } else {
      pluginRequestPermissions(new String[] {
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.READ_PHONE_STATE
      }, REQUEST_COLLECT);
    }
  }

  private void collectSystemInfo() {
    JSObject ret = new JSObject();
    try {
      byte[] info = DeviceInfoManager.getCollectInfo(this.getContext());
      if (info != null) {
        String systemInfo = Base64.encode(info);
        Log.e("ClientInfo: ", systemInfo);
        if (!TextUtils.isEmpty(systemInfo)) {
          ret.put("value", systemInfo);
          call.resolve(ret);
        } else {
          call.reject("");
        }
      } else {
        call.reject("");
      }
    } catch (Exception e) {
      call.reject(e.getLocalizedMessage(), e);
    }
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    PluginCall savedCall = getSavedCall();
    if (savedCall == null) {
      return;
    }

    for(int result : grantResults) {
      if (result == PackageManager.PERMISSION_DENIED) {
        savedCall.error("User denied permission");
        return;
      }
    }

    if (requestCode == REQUEST_COLLECT) {
      collectSystemInfo();
    }
  }
}
