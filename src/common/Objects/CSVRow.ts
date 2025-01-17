/**
 * @file This file contains the CSVRow object
 */

import got, { Got } from "got";

import { CSVConf, HTAccessConf } from "./../../culturize.conf";

const validUrl = require("valid-url");

/**
 * This class contains the relevant data of a CSV file row. This is usually
 * used in arrays.
 */
export class CSVRow {
    // first row containing data is at row 2 of the csv sheet, because of header
    public static count: number = 2;


    /**
     * Creates a CSVRow instance from a (presumed valid) row of data.
     * @param {any} row The row of data
     * @returns The instance, or null if the row of data is invalid/incomplete or disabled.
     */
    public static createRow(row: any): CSVRow {
        if (this.checkColumns(row)) {
            const columns: number[] = [];
            columns.push(1 + Reflect.ownKeys(row).indexOf(CSVConf.COL_PID));
            columns.push(1 + Reflect.ownKeys(row).indexOf(CSVConf.COL_DOCTYPE));
            columns.push(1 + Reflect.ownKeys(row).indexOf(CSVConf.COL_URL));
            columns.push(1 + Reflect.ownKeys(row).indexOf(CSVConf.COL_ENABLED));
            return new CSVRow(
                row[CSVConf.COL_PID],
                row[CSVConf.COL_DOCTYPE],
                row[CSVConf.COL_URL],
                row[CSVConf.COL_ENABLED],
                columns,
            );
        }
        return null;
    }


    /**
     * Checks if a row contains the necessary columns.
     * PID, URL and enabled are always required, doctype can be configured to not be
     * required.
     *
     * @static
     * @param {any} row The row of data to be checked
     * @returns True if the row is valid, false otherwise.
     */
    private static checkColumns(row: any): boolean {
        return CSVConf.COL_PID in row &&
            CSVConf.COL_URL in row &&
            (CSVConf.COL_DOCTYPE in row || CSVConf.ALLOW_NO_DOCTYPE) &&
            CSVConf.COL_ENABLED in row;
    }

    // Members
    public index: number;
    public columns: string[];
    public pid: string;
    public docType: string;
    public url: string;
    public enabled: string;
    public valid: boolean;
    public error: string[];
    public affectedCels: string[];
    public urlChecked: boolean;
    public urlWorking: boolean;
    public duplicateOf: number = -1;

    /**
     * The constructor of the class, which is private so it can
     * only be used by the factory method createRow.
     * @constructor
     * @param {string} pid The value of the PID field
     * @param {string} docType The value of the Document Type field
     * @param {string} url The value of the URL Field
     * @param {string} enabled The value of the enabled Field
     * @param {number[]} Column number for the different inputs
     */
    private constructor(pid: string, docType: string, url: string, enabled: string, columns: number[]) {
        this.index = CSVRow.count;
        CSVRow.count += 1;
        this.columns = [];
        for (let index of columns) {
            let column: string = "";
            if (index > 26) {
                column += String.fromCharCode(64 + Math.floor(index / 26));
            }
            if (index % 26 === 0) {
                column += "Z";
            }
            index %= 26;
            if (index > 0) {
                column += String.fromCharCode(64 + index);
            }

            this.columns.push(column);
        }

        this.pid = pid.trim();
        if (docType != null) {
            this.docType = docType.trim();
        } else {
            this.docType = "";
        }
        this.url = url.trim();
        this.enabled = enabled.trim();

        this.error = [];
        this.affectedCels = [];
        this.valid = this.isValid();
        this.urlChecked = false;
        this.urlWorking = false;
    }

    /**
     * Checks if a row should be converted
     *
     * A row is enabled in all cases, except if the COL_ENABLED field is
     * present and set to 0.
     * @static
     * @param {any} row The row to be checked
     * @returns true if the row should be enabled, false otherwise.
     */
    public isValidAndEnabled(): boolean {
        return this.valid && this.enabled === "1";
    }

    /**
     * Checks if a row should be converted
     *
     * A row is enabled in all cases, except if the COL_ENABLED field is
     * present and set to 0.
     * @static
     * @param {number} othIndex: index of the duplicate entry
     * @returns true if the row should be enabled, false otherwise.
     */
    public markAsDuplicateOf(othIndex: number) {
        // E07 duplicate entry
        this.error.push("E07");
        this.duplicateOf = othIndex;
        if (this.affectedCels.indexOf("duplicate") === -1) {
            this.affectedCels.push("duplicate");
        }
    }

    /**
     * Check is URL is reachable
     *
     * @returns boolean
     */
    public async checkURL() {
        if (this.error.indexOf("E04") !== -1) {
            return;
        }
        try {
            this.urlChecked = true;
            const result = await got(this.url, {method: "HEAD", throwHttpErrors: false, timeout: 2000});
            if (result.statusCode !== 200) {
                this.urlWorking = false;
                this.error.push("E06");
            } else {
                this.urlWorking = true;
            }
        } catch (error) {
            this.urlWorking = false;
            this.error.push("E06");
        }
    }
    /**
     * Convert the row data to an HTML table row for report generation
     *
     * @returns HTML string for a table row
     */
    public createHTMLRow(): string {
        let enabledCel: string;
        if (this.error.indexOf("E05") !== -1) {
            enabledCel = `<td class="error" title="not 0 or 1">${this.enabled}</td>`;
        } else {
            enabledCel = `<td>${this.enabled}</td>`;
        }

        let doctypeCel: string;
        if (this.error.indexOf("E02") !== -1) {
            doctypeCel = `<td class="error" title="Invalid characters">${this.docType}</td>`;
        } else if (this.error.indexOf("E03") !== -1) {
            doctypeCel = `<td class="error" title="No document type specified">${this.docType}</td>`;
        } else {
            doctypeCel = `<td>${this.docType}</td>`;
        }

        let pidCel: string;
        if (this.error.indexOf("E01") !== -1) {
            pidCel = `<td class="error" title="Invalid characters">${this.pid}</td>`;
        } else {
            pidCel = `<td>${this.pid}</td>`;
        }

        let urlCel: string;
        if (this.error.indexOf("E04") !== -1) {
            if (this.url === "") {
                urlCel = `<td class="error" title="${this.url}">no URL</td>`;
            } else {
                urlCel = `<td class="error" title="${this.url}">invalid URL</td>`;
            }
        } else {
            urlCel = `<td title="${this.url}">valid URL</td>`;
        }

        let urlCheckCel: string;
        if (this.urlChecked) {
            if (this.urlWorking) {
                urlCheckCel = `<td class="check"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#15B28E"/></svg></td>`;
            } else {
                urlCheckCel = `<td class="check error" title="URL unavailable"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z "/><path d="M0 24V0" fill="none"/></svg></td>`;
            }
        } else {
            urlCheckCel = `<td class="check" title="URL not tested"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg></td>`;
        }

        let affectedCel: string;
        if (this.error.indexOf("E07") !== -1) {
            affectedCel = `<td class="error" title="doctype, pid combination is duplicate of row ${this.duplicateOf}">${this.affectedCels.join(",")}</td>`;
        } else {
            affectedCel = `<td>${this.affectedCels.join(",")}</td>`;
        }
        return `<tr class="${this.error.length > 0 ? "invalid" : "valid"}">` +
            `<td>${this.index}</td>` +
            enabledCel + doctypeCel + pidCel + urlCel + affectedCel + urlCheckCel +
            `</tr>\n`;
    }

    /**
     * Helper function that checks if a CSVRow instance contains
     * valid data.
     *
     * @returns true if the row is valid, false if not valid, sets the error codes
     */
    private isValid(): boolean {
        /**
         * Checks if a string obeys the "^([a-z]|[A-Z]|[0-9]|-|_)+$"
         * regular expression.
         *
         * TL;DR: The string can only contains uppercase/lowercase letters, numbers, dashes and underscores.
         * @param {string} text The string to be checked
         * @returns True if the string is considered valid, false otherwise.
         */
        const fn = (text: string): boolean => {
            return /^([a-z]|[A-Z]|[0-9]|-|_)+$/.test(text);
        };

        let retval: boolean = true;

        // Check the PID.
        if (!fn(this.pid)) {
            // E01 document type has invalid characters
            this.error.push("E01");
            this.affectedCels.push(`${this.columns[0]}${this.index}`);
            retval = false;
        }

        // Check if the doctype isn't empty
        if (this.docType !== "") {
            // If the document type is not empty, check if it's recognized by the Regular Expression.
            // If it isn't, we have an error.
            if (!fn(this.docType)) {
                // E02 document type has invalid characters
                this.error.push("E02");
                this.affectedCels.push(`${this.columns[1]}${this.index}`);
                retval = false;
            }
        // If the doctype is empty, check if it's allowed. If it isn't -> error.
        } else if (!CSVConf.ALLOW_NO_DOCTYPE) {
            // E03 : No document type in row
            this.error.push("E03");
            this.affectedCels.push(`${this.columns[1]}${this.index}`);
            retval = false;
        }

        if (!validUrl.isWebUri(this.url)) {
            // E04 : invalid URL
            this.error.push("E04");
            this.affectedCels.push(`${this.columns[2]}${this.index}`);
            retval = false;
        }

        if (this.enabled !== "1" && this.enabled !== "0") {
            // E05 : invalid enabled column
            this.error.push("E05");
            this.affectedCels.push(`${this.columns[3]}${this.index}`);
            retval = false;
        }

        // If we passed all the checks, return "null" (for success)
        return retval;
    }
}
