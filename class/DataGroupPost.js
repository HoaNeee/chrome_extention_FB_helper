/**
 * @typedef {import("../types/types").Base64Object} Base64Object
 
 */

export default class DataGroupPost {
  /**
   *
   * @param {string} title
   * @param {Array<string>} contents
   * @param {Array<string|Base64Object>} files
   * @param {string} name
   * @param {number} priority
   * @param {string} id
   */
  constructor(
    title = "",
    contents = [],
    files = [],
    name = "",
    priority = 1,
    id = "",
  ) {
    this.title = title;
    this.contents = contents;
    this.files = files;
    this.name = name;
    this.priority = priority;
    this.id = id;
  }

  toJSON() {
    return {
      title: this.title,
      contents: this.contents,
      files: this.files,
      name: this.name,
      priority: this.priority,
      id: this.id,
    };
  }

  /**
   * @param {DataGroupPost} data
   * @returns {DataGroupPost}
   */
  static buildFromObject(data) {
    return new DataGroupPost(
      data?.title || "",
      data?.contents || [],
      data?.files || [],
      data?.name || "",
      data?.priority || 1,
      data?.id || "",
    );
  }
}
