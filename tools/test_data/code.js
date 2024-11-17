import { example1 } from "./utils/examples";
import { mylog } from "./utils/simple_logger";
import { claspRunWrapper } from "./utils/clasp_run_wrapper";
function _start() {
    claspRunWrapper(() => {
        example1();
    });
    // trick clasp run to return simple log
    mylog("r2d2");
    return mylog();
}
