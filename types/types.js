/**
 * @typedef {Object} Base64Object
 * @property {string} name
 * @property {string} base64Data
 * @property {string} type
 */

/**
 * @typedef {Object} PriorityTask
 * @property {number} priority_task_post
 * @property {number} priority_task_comment_walk
 */

/**
 * @typedef {Object} TimeDelay
 * @property {number} time_delay_click_to_post
 * @property {number} time_delay_fill_content
 * @property {number} time_delay_fill_file
 * @property {number} time_delay_post
 * @property {number} time_delay_open_new_tab
 */

/**
 * @typedef {Object} TimeDelayCommentWalk
 * @property {number} min_time_delay_fill_content_comment_walk
 * @property {number} max_time_delay_fill_content_comment_walk
 * @property {number} time_delay_fill_file_comment_walk
 * @property {number} time_delay_submit_comment_walk
 */

/**
 * @typedef {Object} PostConfig
 * @property {number} max_group_per_batch
 * @property {number} time_delay_click_to_post
 * @property {number} time_delay_fill_content
 * @property {number} time_delay_fill_file
 * @property {number} time_delay_post
 * @property {number} time_delay_open_new_tab
 * @property {number} last_time_post
 * @property {boolean} is_shuffle_group_need_post
 * @property {boolean} is_spammed
 */

/**
 * @typedef {Object} CommentWalkConfig
 * @property {number} max_comment_walk_per_batch
 * @property {boolean} is_spammed_comment_walk
 * @property {boolean} is_comment_walk
 * @property {number} time_delay_fill_content_comment_walk_min
 * @property {number} time_delay_fill_content_comment_walk_max
 * @property {number} time_delay_fill_file_comment_walk
 * @property {number} time_delay_submit_comment_walk
 * @property {Array<string>} content_query_includes_common_comment_walk
 * @property {Array<string>} content_query_excludes_common_comment_walk
 * @property {number} match_rate_value_content_query_includes_common_comment_walk
 * @property {number} last_time_comment_walk
 * @property {string} comment_walk_area
 * @property {Array<string>} keywords_certain_choice_comment_walk // just active for area home
 * @property {string} comment_walk_speed
 * @property {boolean} is_skip_post_not_in_group
 * @property {boolean} is_combine_keywords_title_group
 * @property {boolean} is_ai_help_comment_walk
 */

/**
 * @typedef {Object} DeviceSetting
 * @property {number} id
 * @property {boolean} is_fix_steal_focus
 * @property {boolean} is_fix_steal_all_focus
 * @property {boolean} is_random_break_batch
 * @property {boolean} is_random_time_post
 * @property {boolean} is_special_frame_hours
 * @property {boolean} is_scheduler
 * @property {boolean} is_execute_priority_task
 * @property {Array<string>} strictly_match_title_group
 * @property {boolean} is_comment_when_post
 * @property {boolean} is_interact_batch
 * @property {boolean} is_remote
 * @property {number} time_break_when_spammed
 * @property {number} last_time_interact
 * @property {boolean} is_stop_task
 * @property {boolean} is_remote_control
 *
 * @property {PostConfig} post_config
 * @property {CommentWalkConfig} comment_walk_config
 * @property {PriorityTask} priority_task
 * @property {string} device_id
 */

/**
 * @typedef {Object} Device
 * @property {string} id
 * @property {string} device_name
 * @property {string} device_type
 */

export {};
