# Data Recorder
A simple library to record data in chunks

## Requirements
Database connection is required for using `datarecorder`. Refer to [MultiDbOrm](https://github.com/shiveshnavin/multi-db-orm) for more details
Supported databases:
 - MongoDB
 - Google Firestore
 - SQlite3

## Install
Run in your NodeJS root
```
npm install -s datarecorder
```

## Usage

### Initialize the reocorder
Initialize with chunk size and multidb database connection.

 - chunkSize : Chunk size is the number of records which will be clubbed and flushed to database.
 - db : Optional. A `MultiDbORM` database connection. If db is not passed a local file based sqlite db is used. 

Example using SQLite 
 
```
let recorder = require('datarecorder')

let chunkSize = 100;
let messageRecorder = recorder('myMessageRecorderID')
messageRecorder.init(chunkSize)

```

Example using firestore: 
```
let recorder = require('datarecorder')

let chunkSize = 100;
const { MultiDbORM, FireStoreDB, MongoDB, SQLiteDB } = require("multi-db-orm");
let db = new FireStoreDB('./path/to/serviceaccount.json');

let messageRecorder = recorder('myMessageRecorderID',db)
messageRecorder.init(chunkSize)

```

### Record data
After every `chunkSize` records the data will be flushed to database automatically. 
```
messageRecorder.record({
    location:"Home",
    message:"An elephant entered the wardrobe"
})
messageRecorder.record({
    location:"Office",
    message:"The wabbit burnt the closet."
})

```

Once you are done with recording the data or want to flush the data manually , you can explicitly flush using.
```
messageRecorder.flush()
```

### Read Data
Reads the saved records in ascending order of time and returns and array.
```
let messages = await messageRecorder.read()
console.log('Read', messages.length, 'messages')

```


### Delete Data
This will remove all the records for `messageRecorder`
```
let messages = await messageRecorder.delete()

```