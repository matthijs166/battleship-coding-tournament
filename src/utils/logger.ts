class Logger {
    private static instance: Logger;
    protected queue: LogLine[] = [];

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    log(message: any) {
        this.queue.push({
            type: logTypes.log,
            message
        });
    }

    warning(message: any) {
        this.queue.push({
            type: logTypes.warning,
            message
        });
    }

    error(message: any) {
        this.queue.push({
            type: logTypes.error,
            message
        });
    }

    printAll(maxLines: number = -1) {
        console.log("---- All LOG messages: ---- ");
        this.queue
        // revert order
        .slice().reverse()
        // limit lines if -1 then no limit
        .slice(0, maxLines)
        .forEach((line) => {
            line.message = this.formatMessage(line.message);
            switch (line.type) {
                case logTypes.log:
                    console.log("[LOG]: ", line.message);
                    break;
                case logTypes.warning:
                    console.log("[WARNING]: ", line.message);
                    break;
                case logTypes.error:
                    console.log("[ERROR]: ", line.message);
                    break;
            }
        });
    }

    formatMessage(message: any): string {
        if (typeof message === "object") {
            return JSON.stringify(message, null, 2);
        }
        return message;
    }
}

enum logTypes {
    log,
    warning,
    error
}

type LogLine = {
    type: logTypes,
    message: any
}

export default Logger.getInstance();