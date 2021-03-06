/* tslint:disable:max-classes-per-file */

// Probably a bad idea to use the same name as something from the JavaScript libraries.
export class Error {
    public name: string;
    public message: string;
    public index: number;
    public lineNumber: number;
    public column: number;
    public description: string;
    constructor(message: string) {
        this.message = message;
    }
}

export class ErrorHandler {
    readonly errors: Error[];
    tolerant: boolean;

    constructor() {
        this.errors = [];
        this.tolerant = false;
    }

    recordError(error: Error): void {
        this.errors.push(error);
    }

    tolerate(error: Error): void {
        if (this.tolerant) {
            this.recordError(error);
        } else {
            throw error;
        }
    }

    constructError(msg: string, column: number): Error {
        let error = new Error(msg);
        try {
            throw error;
        } catch (base) {
            /* istanbul ignore else */
            if (Object.create && Object.defineProperty) {
                error = Object.create(base as Error);
                Object.defineProperty(error, 'column', { value: column });
            }
        }
        /* istanbul ignore next */
        return error;
    }

    createError(index: number, line: number, col: number, description: string): Error {
        const msg = 'Line ' + line + ': ' + description;
        const error = this.constructError(msg, col);
        error.index = index;
        error.lineNumber = line;
        error.description = description;
        return error;
    }

    throwError(index: number, line: number, col: number, description: string): never {
        throw this.createError(index, line, col, description);
    }

    tolerateError(index: number, line: number, col: number, description: string) {
        const error = this.createError(index, line, col, description);
        if (this.tolerant) {
            this.recordError(error);
        } else {
            throw error;
        }
    }
}
