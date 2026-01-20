const fs = require("fs");
const { MultiDbORM, FireStoreDB, MongoDB, SQLiteDB, Sync } = require("multi-db-orm");

module.exports = (recordId, multiDb, tableName = 'records') => {
    var db;

    if (multiDb) {
        db = multiDb
    }
    else {
        db = new SQLiteDB('./db.db');
    }

    let module = {}
    let chunkSize = 100;
    let chunks = []
    /**
     * 
     * @param {number} persistChunkSize Chunk size to flush
     * @param {MultiDbORM} multiDb Optional MultiDbORM DB instance
     */
    module.init = function (persistChunkSize) {
        if (persistChunkSize)
            chunkSize = persistChunkSize;

        db.create(tableName, {
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
        await db.insert(tableName, {
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
        let chunked = await db.get(tableName, { recordId: recordId })
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
        await db.delete(tableName, { recordId: recordId })
        console.log('Deleted all chunks of', recordId)
    }



    return module;

}