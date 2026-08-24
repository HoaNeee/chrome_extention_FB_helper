export default class CommentWalk {
  constructor(
    id = "",
    title_query_searchs = [],
    name = "",
    contents = "",
    files = [],
    keyword_query_includes = [],
    keyword_query_excludes = [],
    match_rate_value_content_query_includes = 0,
  ) {
    this.id = id;
    this.title_query_searchs = title_query_searchs;
    this.name = name;
    this.contents = contents;
    this.files = files;
    this.keyword_query_includes = keyword_query_includes;
    this.keyword_query_excludes = keyword_query_excludes;
    this.match_rate_value_content_query_includes =
      match_rate_value_content_query_includes;
  }

  /**
   * @param {CommentWalk} object
   */
  static buildFromObject(object) {
    return new CommentWalk(
      object.id,
      object.title_query_searchs,
      object.name,
      object.contents,
      object.files,
      object.keyword_query_includes,
      object.keyword_query_excludes,
      object.match_rate_value_content_query_includes,
    );
  }
}
