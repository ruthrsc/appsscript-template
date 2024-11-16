import { mylog } from "./simple_logger";

export function claspRunWrapper(fn: CallableFunction): string {
  try {
    fn();
  } catch (e) {
    mylog(e);
    if (e instanceof Error) {
      mylog(e.stack);
    }
  }

  return mylog();
}
