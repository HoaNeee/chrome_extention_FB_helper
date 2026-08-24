import { IndexedDB } from "./indexed-db.js";
import { KEY_INDEXED_DB_TABLE_NAME } from "../contants/constant-extention.js";
import DataGroupPost from "../class/DataGroupPost.js";

export class DataGroupPostDB {
  constructor() {
    this.db = new IndexedDB(KEY_INDEXED_DB_TABLE_NAME.DATA_GROUP_POST);
  }

  // Lấy toàn bộ mảng data
  /**
   *
   * @returns {Promise<Array<DataGroupPost>>}
   */
  async getAllDataSaved() {
    return await this.db.get();
  }

  // Lưu toàn bộ mảng (ghi đè)
  /**
   *
   * @param {Array<DataGroupPost>} postsArray
   * @returns {Promise<void>}
   */
  async saveDataPosts(postsArray) {
    postsArray = postsArray.map((item) => DataGroupPost.buildFromObject(item));
    return await this.db.set(postsArray);
  }

  /**
   * Add a new post to the array
   * @param {DataGroupPost} newPost
   * @returns {Promise<string>}
   */
  async addDataPost(newPost) {
    const posts = await this.getAllDataSaved();

    const post = DataGroupPost.buildFromObject(newPost);

    posts.push(post);

    await this.saveDataPosts(posts);

    return post.id;
  }

  /**
   * Update data post by ID
   * @param {string} postId
   * @param {DataGroupPost} updatedData
   * @returns {Promise<void>}
   */
  async updateDataPost(postId, updatedData) {
    if (!updatedData.id) {
      return;
    }
    const posts = await this.getAllDataSaved();
    const index = posts.findIndex((p) => p.id === postId);

    if (index === -1 || posts[index].id !== updatedData.id) {
      return;
    }

    const post = DataGroupPost.buildFromObject(updatedData);

    posts[index] = { ...posts[index], ...post };

    await this.saveDataPosts(posts);
  }

  /**
   * Delete data post by ID
   * @param {string} postId
   * @returns {Promise<void>}
   */
  async deleteDataPost(postId) {
    const posts = await this.getAllDataSaved();
    const filtered = posts.filter((p) => p.id !== postId);
    await this.saveDataPosts(filtered);
  }

  /**
   * Find data post by ID
   * @param {string} postId
   * @returns {Promise<DataGroupPost | null>}
   */
  async getDataPost(postId) {
    const posts = await this.getAllDataSaved();
    return posts.find((p) => p.id === postId);
  }

  // Clear tất cả
  /**
   *
   * @returns {Promise<void>}
   */
  async clearAll() {
    await this.saveDataPosts([]);
  }
}
