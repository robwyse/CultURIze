/**
 * @file Contains various configuration/defaults user
 * everywhere in the app.
 */

/**
 * Default values for the "Publish" form in main.html.
 */
export class PublishFormDefaults {
  /**
   * The default value for the subdirectory field.
   * @static
   */
  static subdir: string = "";

  /**
   * The default for the target github repo
   * @static
   */
  static repo: string = "";

  // Fields in the "advanced options"
  // It is recommended that you don't leave theses empty, so
  // the user doesn't have to complete them himself.

  /**
   * Default branch to push to
   * @static
   */
  static branch: string = "master";

  /**
   * Default commit message
   * @static
   */
  static commitMessage: string = "Culturize Import";

  /**
   * Default Pull Request title
   * @static
   */
  static pullrequestTitle: string = "Culturize Import";

  /**
   * Default Pull Request body.
   * @static
   */
  static pullrequestBody: string =
    "This pull request was automatically generated by the Culturize App";
}

/**
 * Contains the options for the Publish process.
 */
export class PublishOptions {
  /**
   * This a subdirectory that's going to be transparantly
   * inserted in front of the user-given subdirectory.
   * This must follow the same regex as the subdirectory (/^([\w-]+)(((\/)([\w-]+))+)?$/).
   * If the regex doesn't recognize the string, it's going to be ignored.
   * In short: no spaces allowed, only letters/numbers, hyphens and underscores. Don't begin or
   * end the path with slashes. Only use one forward slash '/' for multiple subdirectories.
   *
   * It is highly recommended that you test the app after changing this, because a bad input
   * here can cause errors for the end user (errors that he won't be able to solve by himself!).
   *
   * Example values:
   *
   *      Correct: "My_org/test", "foo", "1/2/3"
   *
   *      Incorrect: "MyOrg\ test", "my org/foo/"
   *
   * Example result: the baseSubdir is "foo/bar", and the user
   * wants to push to "b/baz", the final subdirectory for the
   * .htaccess, starting from the root will be "foo/bar/b/baz"
   *
   *
   * @static
   */
  static baseSubdir: string = "";
}

/**
 * Comma-separated values (.csv) files configuration/options.
 */
export class CSVConf {
  /**
   * The name of the column which contains the PID.
   * @static
   */
  static COL_PID = "PID";

  /**
   * The name of the column which contains the URL.
   * @static
   */
  static COL_URL: string = "URL";

  /**
   * The name of the column which contains the (optional) enabled flag.
   * @static
   */
  static COL_ENABLED: string = "enabled";

  /**
   * The name of the column which contains the (maybe optional) document type.
   * @static
   */
  static COL_DOCTYPE: string = "document type";

  /**
   * If this is set to true, the converter will
   * simply ignore a row containing incompatible data (such as a ill-formed pid, or
   * a missing document type) instead of stopping and reporting the error to the user.
   * @static
   */
  static IGNORE_ON_INVALID_DATA: boolean = true;

  /**
   * If this is set to true, the converter will accept rows where the doctype is
   * null/empty.
   * @static
   */
  static ALLOW_NO_DOCTYPE: boolean = true;
}

/**
 * Configuration for the HTAccess file generation
 */
export class HTAccessConf {
  /**
   * The redirection code when a redirection request is accepted.
   * Default is 302. This must be in the 300-399 range for the redirection to work.
   * https://httpd.apache.org/docs/2.4/en/rewrite/flags.html#flag_r
   * @static
   */
  static redirectionCode: number = 302;

  /**
   * If this is set to true, the redirection will be case-insensitive
   * (it will work even if the PID is type in lowercase/uppercase, etc)
   * https://httpd.apache.org/docs/2.4/en/rewrite/flags.html#flag_nc
   * @static
   */
  static caseInsensitiveRedirs: boolean = true;

  /**
   * If this is set to true, the "noescape" flag will be set,
   * prohibiting apache from converting characters in their
   * hexcode equivalent. It is highly recommended that you leave this to
   * true.
   * https://httpd.apache.org/docs/2.4/en/rewrite/flags.html#flag_ne
   * @static
   */
  static noEscape: boolean = true;
}
