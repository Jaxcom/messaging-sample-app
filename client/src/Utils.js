export default class Utils {
  static formatE164ToUsLocal(number) {
    return `(${number.substring(2, 5)}) ${number.substring(
      5,
      8
    )}-${number.substring(8, 12)}`;
  }

  static threadIdToFromNumber(threadId) {
    // the first number in the thread id is the from number
    if (!threadId || threadId === "") {
      return "";
    }
    return threadId.split(",")[0]
  }

  static threadIdToFriendlyList(threadId) {
    if (!threadId || threadId === "") {
      return "";
    }
    let recipients = threadId.split(",");
    recipients.shift() // remove first number, it is the from number
    return recipients.join(",")
  }

  static sanitizeThreadId(fromNumber, toNumbers) {
    if (fromNumber !== "" && toNumbers !== "") {
      // a full thread id requires a from number and at least one to number
      return fromNumber.trim() + "," + toNumbers.trim();
    }
    return "";
  }
}
