import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CtpPlugin)
public class CtpPlugin: CAPPlugin {

    @objc func collect(_ call: CAPPluginCall) {
        // 更新上报信息
        let supersion: Supervision = Supervision()
        let systemInfo = supersion.getSystemInfo() ?? ""
        call.resolve(["value": systemInfo])
    }
}
