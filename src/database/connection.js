import { connect } from 'mongoose';

// Replace <<NameDatabase>> for your local database name
const URI = 'mongodb://0.0.0.0/thinker-app';

connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(db => console.log(">>> Database is connected"))
    .catch(err => console.error(err));
