import CommentWalk from "../class/CommentWalk.js";
import { KEY_INDEXED_DB_TABLE_NAME } from "../contants/constant-extention.js";
import { IndexedDB } from "./indexed-db.js";

export class DataCommentWalkDB {
  constructor() {
    this.db = new IndexedDB(KEY_INDEXED_DB_TABLE_NAME.COMMENT_WALK);
  }

  /**
   * Get all data comment walk from storage
   * @returns {Promise<Array<CommentWalk>>}
   */
  async getAllDataCommentWalk() {
    return (await this.db.get()) || [];
  }

  /**
   * Save data comment walk to storage
   * @param {CommentWalk[]} dataCommentWalks
   * @returns {Promise<CommentWalk[]>}
   */
  async saveDataCommentWalk(dataCommentWalks) {
    const newData = dataCommentWalks.map((item) =>
      CommentWalk.buildFromObject(item),
    );
    await this.db.set(newData);
    return newData;
  }

  /**
   * Add data comment walk to storage
   * @param {CommentWalk} dataCommentWalk
   * @returns {Promise<CommentWalk>}
   */
  async addDataCommentWalk(dataCommentWalk) {
    const data = await this.getAllDataCommentWalk();
    data.push(CommentWalk.buildFromObject(dataCommentWalk));
    await this.saveDataCommentWalk(data);
    return dataCommentWalk;
  }

  async addListCommentWalk(dataCommentWalks) {
    const data = await this.getAllDataCommentWalk();

    const newData = dataCommentWalks.map((item) =>
      CommentWalk.buildFromObject(item),
    );

    data.push(...newData);
    await this.saveDataCommentWalk(data);
    return dataCommentWalks;
  }

  /**
   * Delete data comment walk from storage
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteDataCommentWalk(id) {
    const data = await this.getAllDataCommentWalk();
    const newData = data.filter((item) => item.id !== id);
    await this.saveDataCommentWalk(newData);
  }

  /**
   * Update data comment walk from storage
   * @param {string} id
   * @param {CommentWalk} dataCommentWalk
   * @returns {Promise<CommentWalk>}
   */
  async updateDataCommentWalk(id, dataCommentWalk) {
    const data = await this.getAllDataCommentWalk();

    const object = CommentWalk.buildFromObject(dataCommentWalk);

    const newData = data.map((item) =>
      item.id === id ? { ...item, ...object } : item,
    );

    await this.saveDataCommentWalk(newData);
    return object;
  }

  /**
   * Get data comment walk by id from storage
   * @param {string} id
   * @returns {Promise<CommentWalk | null>}
   */
  async getDataCommentWalkById(id) {
    const data = await this.getAllDataCommentWalk();
    return data.find((item) => item.id === id);
  }

  /**
   * Clear data comment walk from storage
   * @returns {Promise<void>}
   */
  async clearDataCommentWalk() {
    await this.saveDataCommentWalk([]);
  }
}
