
export class UserError extends Error {
    constructor(
        message: string,
        public type: 'NotFound' | 'Unauthorized' | 'BadRequest' | 'Forbidden' | 'InternalServerError',
        public status: number = 500 // Default status code
    ) {
        super(message);
        this.name = 'UserError';
        this.type = type;

        // Set the status code based on the error type
        switch (this.type) {
            case 'Unauthorized':
                this.status = 401;
                break;
            case 'BadRequest':
                this.status = 400;
                break;
            case 'NotFound':
                this.status = 404;
                break;
            case 'Forbidden':
                this.status = 403;
                break;
            default:
                this.status = 500;
        }
    }

    response() {
        return { type: this.type, message: this.message };
    }
}
