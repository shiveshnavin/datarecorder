const fs = require("fs");
const { MultiDbORM, FireStoreDB, MongoDB, SQLiteDB, Sync } = require("multi-db-orm");

var db;

if (fs.existsSync('./serviceaccount.json')) {
    db = new FireStoreDB('./serviceaccount.json');
}
else if (process.env.SERIVCE_KEY_OBJ_JSON) {
    db = new FireStoreDB(JSON.parse(process.env.SERIVCE_KEY_OBJ_JSON));
}
else {
    db = new SQLiteDB('./db.db');
}

module.exports = (recordId) => {

    let module = {}
    let chunkSize = 100;
    let chunks = []
    /**
     * 
     * @param {number} persistChunkSize Chunk size to flush
     * @param {MultiDbORM} multiDb Optional MultiDbORM DB instance
     */
    module.init = function (persistChunkSize, multiDb) {
        if (persistChunkSize)
            chunkSize = persistChunkSize;
        if (multiDb)
            db = multiDb
        db.create('records', {
            id: recordId,
            recordId: recordId,
            timeStamp: Date.now(),
            chunks: "[]"
        })
    }

    module.record = async function (chunk) {
        chunks.push(chunk)
        if (chunks.length >= chunkSize) {
            await module.flush()
        }
    }

    module.flush = async function () {
        let buf = chunks;
        chunks = []
        let timeStamp = Date.now();
        let id = `${recordId}_${timeStamp}`
        await db.insert('records', {
            id: id,
            recordId: recordId,
            timeStamp: timeStamp,
            chunks: JSON.stringify(buf)
        })
        console.log('Flushed ', buf.length, 'chunks of', recordId)
    }

    module.read = async function (id) {
        if (id)
            recordId = id
        let chunked = await db.get('records', { recordId: recordId })
        let records = []

        for (let index = 0; index < chunked.length; index++) {
            const recordChunk = chunked[index];
            let thisChunk = JSON.parse(recordChunk.chunks);
            records.push(...thisChunk)
        }
        records.sort(function (a, b) {
            return (a.timeStamp) - (b.timeStamp);
        });
        console.log('Read ', records.length, 'records from', chunked.length, 'chunks of', recordId)
        return records;

    }

    module.delete = async function (id) {
        if (id)
            recordId = id
        await db.delete('records', { recordId: recordId })
        console.log('Deleted all chunks of', recordId)
    }



    return module;

}