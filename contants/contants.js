const KEY_RETRY_CALL = "retry_call";
const KEY_RE_POST_ALL_GROUP = "re_post_all_group";

/**
 * Area setting general key
 */
const KEY_SCHEDULER = "scheduler";
const KEY_QUEUE = "queue";
const KEY_LANGUAGE = "language";
const KEY_MY_SIGNATURE = "my_signature";

const APP_NAME = "FB Tools Helper";

/**
 * Area setting input key
 */
const KEY_TITLE_STRICTLY_MATCH_GROUP = "title_strictly_match_group";
const KEY_TIME_DELAY = "time_delay";
const KEY_MAX_GROUP_PER_TIME = "max_group_per_time";

/**
 * Area setting boolean key
 */
const KEY_IS_SHOW_DASHBOARD = "is_show_dashboard";
const KEY_IS_TEST = "is_test";
const KEY_IS_IN_PROGRESS = "is_in_progress";
const KEY_STOP_TASK = "is_stop_task";
const KEY_IS_DEVELOPER_MODE = "is_developer_mode";
const KEY_IS_SCROLL_DETECT_LIST_GROUP = "is_scroll_detect_list_group";
const KEY_IS_FIX_STEAL_FOCUS = "is_fix_steal_focus";
const KEY_IS_FIX_STEAL_ALL_FOCUS = "is_fix_steal_all_focus";
const KEY_IS_SHUFFLE_SCHEDULER_TIME = "is_shuffle_scheduler_time";
const KEY_IS_SHUFFLE_GROUPS_NEED_POST = "is_shuffle_groups_need_post";
const KEY_IS_SPAMMED = "is_spammed";
const KEY_IS_DARK_THEME = "is_dark_theme";
const KEY_IS_RANDOM_BATCH_POST = "is_random_batch_post";
const KEY_IS_RANDOM_TIME_POST = "is_random_time_post";
const KEY_IS_SPECIAL_FRAME_HOURS = "is_special_frame_hours";
const KEY_CHANGE_GROUPS_CHECKED_FLAG = "change_groups_checked_flag";

const KEY_IS_PREMIUM = "is_premium";

/**
 * Area count key
 */
const KEY_COUNT_RESET_GROUPS = "count_reset_groups";

const KEY_COUNT_BATCH_POST = "current_count_batch_post";

const KEY_CURRENT_COUNT_POSTED = "current_count_posted";

/**
 * Area related to groups
 */

const KEY_DATA_POST_SAVED = "data_post_saved";
const KEY_INDEX_GROUP_POST = "current_group_post_index";
const KEY_INDEXS_GROUP_CHECKED = "group_checked_indexs";

const KEY_LAST_TIME_POST = "last_time_post";

const KEY_GROUPS_NEED_POST = "groups_need_post";
const KEY_GROUPS_POSTED = "groups_posted";
const KEY_ALL_GROUPS = "all_groups";

const KEY_POST = "posting";

/**
 * Area other
 */
const KEY_CAN_POST_THIS_TAB = "can_post_this_tab";
const KEY_NEXT_TIME_POST_WHEN_SPAMMED = "next_time_post_when_spammed";
const KEY_SPECIAL_FRAME_HOURS = "special_frame_hours";
const KEY_TIME_DELAY_FOR_SCHEDULER = "time_delay_for_scheduler";

const KEY_HISTORY_LOGS = "history_logs";
const KEY_HISTORY_SYSTEM_LOGS = "history_system_logs";

const MAX_GROUP_PER_TIME_INITIAL = 1;

const KEY_COMMENT_WHEN_POST_SUCCESS = {
  LIST_CONTENT: "list_comment_when_post_success_content",
  IS_ACTIVE: "is_comment_when_post_success",
  MAX_COMMENT_PER_TIME: "max_comment_per_time",
};

const KEY_TAB = {
  LAST_TAB_OPEN_ID: "last_tab_open_id",
  TAB_GET_LIST_GROUP_ID: "tab_get_list_group_id",
  LAST_POST_TAB_OPEN_ID: "last_post_tab_open_id",
  TAB_DASHBOARD_ID: "tab_dashboard_id",
};

const KEY_INTERACT_BEFORE_POST = {
  IS_ACTIVE: "is_interact_before_post",
  MAX_POST_INTERACT: "max_post_interact",
  DECIDED_INTERACT: "decided_interact_before_post",
};

const KEY_WINDOW = {
  WINDOW_GET_LIST_GROUP_ID: "window_get_list_group_id",
};

const STATUS_TASK = {
  PENDING: "pending",
  SELECTING: "selecting",
  DONE: "done",
  POSTING: "posting",
  ERROR: "error",
};

const SCHEDULER_TYPE = {
  EVERY_MINUTES: "custom-every-minutes",
  EVERY_HOURS: "custom-every-hours",
  FRAME_HOURS: "custom-frame-hours",
  DAILY_HOURS: "daily-hours",
  SCHEDULER_MINUTES: "scheduler-minutes",
  SCHEDULER_HOURS: "scheduler-hours",
};

const URL_LIST_GROUPS = "https://www.facebook.com/groups/joins/?nav_source=tab";

const MAX_Z_INDEX = 99;

const prefix = "tm_";

const initialTimeDelay = {
  clickToPost: 4,
  fillContent: 5,
  fillFile: 7,
  post: 5,
  openNewTab: 2,
};

export {
  KEY_RETRY_CALL,
  KEY_IS_SHOW_DASHBOARD,
  KEY_ALL_GROUPS,
  KEY_GROUPS_NEED_POST,
  KEY_GROUPS_POSTED,
  KEY_POST,
  KEY_RE_POST_ALL_GROUP,
  KEY_IS_TEST,
  KEY_LAST_TIME_POST,
  KEY_IS_IN_PROGRESS,
  KEY_STOP_TASK,
  KEY_MAX_GROUP_PER_TIME,
  KEY_SCHEDULER,
  MAX_GROUP_PER_TIME_INITIAL,
  MAX_Z_INDEX,
  KEY_DATA_POST_SAVED,
  KEY_INDEXS_GROUP_CHECKED,
  KEY_INDEX_GROUP_POST,
  KEY_IS_SCROLL_DETECT_LIST_GROUP,
  prefix,
  KEY_TIME_DELAY,
  initialTimeDelay,
  KEY_IS_FIX_STEAL_FOCUS,
  KEY_QUEUE,
  KEY_IS_DEVELOPER_MODE,
  KEY_COUNT_RESET_GROUPS,
  KEY_IS_DARK_THEME,
  KEY_LANGUAGE,
  KEY_TITLE_STRICTLY_MATCH_GROUP,
  STATUS_TASK,
  SCHEDULER_TYPE,
  URL_LIST_GROUPS,
  KEY_TAB,
  KEY_CAN_POST_THIS_TAB,
  KEY_IS_SHUFFLE_SCHEDULER_TIME,
  KEY_IS_SPAMMED,
  KEY_NEXT_TIME_POST_WHEN_SPAMMED,
  KEY_IS_FIX_STEAL_ALL_FOCUS,
  KEY_COUNT_BATCH_POST,
  APP_NAME,
  KEY_HISTORY_LOGS,
  KEY_IS_SHUFFLE_GROUPS_NEED_POST,
  KEY_IS_RANDOM_BATCH_POST,
  KEY_IS_PREMIUM,
  KEY_IS_RANDOM_TIME_POST,
  KEY_IS_SPECIAL_FRAME_HOURS,
  KEY_SPECIAL_FRAME_HOURS,
  KEY_CHANGE_GROUPS_CHECKED_FLAG,
  KEY_CURRENT_COUNT_POSTED,
  KEY_WINDOW,
  KEY_COMMENT_WHEN_POST_SUCCESS,
  KEY_INTERACT_BEFORE_POST,
  KEY_TIME_DELAY_FOR_SCHEDULER,
};
