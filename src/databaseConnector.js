const mariadb = require("mariadb");
let instance = null;

module.exports = class DatabaseConnector {
  constructor() {
    if (instance != null) {
      return instance;
    }
    this.pool = mariadb.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 5
    });

    instance = this;
  }

  async getAllThreads() {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(
        "SELECT DISTINCT id,unread_count,time,text FROM thread JOIN ( SELECT id as messageid,time,text,thread_id from message ) as m ON messageid=last_message_id ORDER BY TIME DESC"
      );
      return rows;
    } catch (e) {
      throw e;
    } finally {
      if (conn) conn.end();
    }
  }

  async threadExists(id) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query("SELECT * FROM thread WHERE id = ?", [id]);
      return rows.length > 0;
    } catch (e) {
      throw e;
    } finally {
      if (conn) conn.end();
    }
  }

  async getMessagesForThread(threadId) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      await conn.beginTransaction();
      const rows = await conn.query(
        "SELECT payload from message WHERE thread_id = ? ORDER BY time ASC",
        [threadId]
      );
      await conn.commit();
      let messages = [];
      rows.forEach(row => {
        messages.push(this.rowToMessage(row));
      });
      return messages;
    } catch (e) {
      throw e;
    } finally {
      if (conn) conn.end();
    }
  }

  async getMessage(messageId) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      await conn.beginTransaction();
      const rows = await conn.query(
        "SELECT payload from message WHERE id = ?",
        [messageId]
      );
      await conn.commit();
      return this.rowToMessage(row);
    } catch (e) {
      throw e;
    } finally {
      if (conn) conn.end();
    }
  }

  async clearUnreadMessagesForThread(number) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      await conn.beginTransaction();
      await conn.query("UPDATE thread SET unread_count = 0 WHERE id = ?", [
        number
      ]);
      await conn.commit();
    } catch (e) {
      throw e;
    } finally {
      if (conn) conn.end();
    }
  }

  async insertMessage(message) {
    let conn;
    let threadId = this.getThreadIdForMessage(message);
    try {
      message = this.removeApplicationId(message);
      conn = await this.pool.getConnection();
      await conn.beginTransaction();
      await conn.query(
        "INSERT INTO message (payload, thread_id) VALUES (?, ?)",
        [message, threadId]
      );
      let query = "UPDATE thread SET last_message_id = ?";
      if (message.direction === "in") {
        query = query + ", unread_count = unread_count + 1";
      }
      query = query + "  WHERE id = ?";
      await conn.query(query, [message.id, threadId]);
      await conn.commit();
      return message;
    } catch (e) {
      throw e;
    } finally {
      if (conn) conn.end();
    }
  }

  async insertThread(id) {
    let conn;
    try {
      conn = await this.pool.getConnection();
      await conn.query("INSERT INTO thread (id) VALUES (?)", [id]);
      return id;
    } catch (e) {
      throw e;
    } finally {
      if (conn) conn.end();
    }
  }

  rowToMessage(row) {
    return JSON.parse(row.payload);
  }

  getThreadIdForMessage(message) {
    let participants = [message.from]
    return participants.concat(message.to.slice()).join();
  }

  removeApplicationId(message) {
    // this is important because we are treating application ids as a secret
    delete message.applicationId;
    return message;
  }
};
