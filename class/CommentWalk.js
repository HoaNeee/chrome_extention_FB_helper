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
    keywords_certain_choice = [],
    description_for_ai = "",
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
    this.keywords_certain_choice = keywords_certain_choice;
    this.description_for_ai = description_for_ai;
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
      object.keywords_certain_choice,
      object.description_for_ai,
    );
  }
}
