import morgan, { StreamOptions } from "morgan";
import logger from "../utility/logger";

const stream: StreamOptions = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

const requestLogger = morgan(
    ":method :url :status :response-time ms - :res[content-length]",
    { stream }
);

export default requestLogger;