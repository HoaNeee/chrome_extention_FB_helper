const KEY_NOTIFICATION = "GM_notification";
const KEY_OPEN_IN_TAB = "GM_openInTab";
const KEY_REGISTER_MENU_COMMAND = "GM_registerMenuCommand";
const KEY_UNREGISTER_MENU_COMMAND = "GM_unregisterMenuCommand";
const KEY_XMLHTTP_REQUEST = "GM_xmlhttpRequest";
const KEY_NOTIFICATION_RESPONSE = "GM_notification_response";
const KEY_OPEN_IN_TAB_RESPONSE = "GM_openInTab_response";
const KEY_REGISTER_MENU_COMMAND_RESPONSE = "GM_registerMenuCommand_response";
const KEY_UNREGISTER_MENU_COMMAND_RESPONSE =
  "GM_unregisterMenuCommand_response";
const KEY_XMLHTTP_REQUEST_RESPONSE = "GM_xmlhttpRequest_response";
const KEY_CLEAR_NOTIFICATION = "clearNotification";

const KEY_CLOSE_THIS_TAB = "CLOSE_THIS_TAB";

const KEY_CLOSE_THIS_WINDOW = "CLOSE_THIS_WINDOW";

const KEY_GET_LIST_GROUPS = "get_list_groups";

const KEY_OPEN_DASHBOARD = "open_dashboard";

const MY_SIGNATURE = "my_signature_sieuhoane";

const STATUS_RESPONSE = {
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",
  UNKNOWN: "UNKNOWN",
};

const URL_MATCH = "https://www.facebook.com/*";

const URL_SEARCH_PAGE = "facebook.com/search/top";

const KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST =
  "get_current_data_group_saved_need_post";

const KEY_UPDATE_STATUS_TASK = "update_status_task_posting";

const KEY_NEXT_POST_GROUP = "next_post_group";

const KEY_SCHEDULER_ALARMS = "scheduler_alarms";

const KEY_CURRENT_WINDOW_ID = "current_window_id";

const KEY_UPDATE_IS_SPAMMED = "update_is_spammed";

const KEY_ADD_LOG = "add_log";

const KEY_FIRST_TIME_USE = "first_time_use";

const KEY_GET_KEY_SAVED = "get_key_saved";

const KEY_SET_KEY_SAVED = "set_key_saved";

const KEY_GET_PREMIUM = "get_premium";

const KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST = {
  GET_ALL_METADATA: "get_all_metadata_comment_when_post_success",
};

const KEY_INTERACT_BEFORE_POST_REQUEST = {
  GET_ALL_METADATA: "get_all_metadata_interact_before_post",
};

const KEY_ADD_TIME_DELAY_FOR_SCHEDULER = "update_time_delay_for_scheduler";

const KEY_IS_USE_LOCAL_STORAGE = "is_use_local_storage";

const MAX_LENGTH_FILE_NAME = 15;

const DEFAULT_DEVICE_ID = "abcxyz12";

const KEY_GET_PARSE_FILE = "get_parse_file";

const KEY_SET_PROCESSING_COMMENT_WALK = "set_processing_comment_walk";

const KEY_CAN_COMMENT_WALK_THIS_TAB = "can_comment_walk_this_tab";

const KEY_GET_ALL_METADATA_COMMENT_WALK = "get_all_metadata_comment_walk";

const KEY_CAN_COMMENT_WALK_THIS_POST = "can_comment_this_post";

const KEY_ADD_URL_COMMENTED = "add_url_commented";

const KEY_COMPLETED_COMMENT_WALK_THIS_BATCH =
  "completed_comment_walk_this_batch";

const KEY_COMMENT_WALK_REQUEST = {
  UPDATE_LAST_TIME_COMMENT: "update_last_time_comment",
  GET_COMMENT_WALK_NEVER_COMMENTED: "get_comment_walk_never_commented",
};

const KEY_STOP_TASK_REQUEST = {
  GET_IS_STOP_TASK: "get_is_stop_task",
};

const KEY_SAVED_TEMP = {
  SCHEDULER: "scheduler_temp",
  SETTING: "setting_temp",
};

const KEY_USER_STATUS = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  PENDING: "PENDING",
};

const KEY_USER_ROLE = {
  ROLE_ADMIN: "ROLE_ADMIN",
  ROLE_USER: "ROLE_USER",
  ROLE_MEMBER: "ROLE_MEMBER",
};

const API_RESPONSE_CODE = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_LOCKED: "USER_LOCKED",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  USER_INACTIVE: "USER_INACTIVE",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
};

const ERROR_CODE = {
  SELF: "SELF",
  SYSTEM: "SYSTEM",
};

const KEY_INDEXED_DB_TABLE_NAME = {
  DATA_GROUP_POST: "dataGroupPost",
  COMMENT_WALK: "commentWalk",
};

const KEY_IMPORT_EXPORT_TYPE = {
  COMMENT_WALK: "COMMENT_WALK",
  DATA_GROUP_POST: "DATA_GROUP_POST",
  KEY_FIELD_OBJECT_TYPE: "data_object_type",
};

const KEY_MESSAGE_FROM_BACKGROUND = {
  AUTOMATION: {
    POST: "automation_post",
    COMMENT_WALK: "automation_comment_walk",
    POST_CONTINUE: "automation_post_continue",
  },
  RELOAD_DASHBOARD: "reload_dashboard",
};

const KEY_COMMENT_WALK_AREA = {
  SEARCH_PAGE: "SEARCH_PAGE",
  HOME: "HOME",
  RANDOM: "RANDOM",
};

const KEY_COMMENT_WALK_SPEED = {
  SLOW: "SLOW",
  NORMAL: "NORMAL",
  FAST: "FAST",
};

const KEY_REQUEST_TO_BACKGROUND = {
  GET_STRICTLY_MATCH_TITLE_GROUP: "get_strictly_match_title_group",
  CHECK_DATA_COMMENT_WALK_MATCH_AT_SEARCH_PAGE:
    "check_data_comment_walk_match_at_search_page",
  CHECK_MULTI_DATA_COMMENT_WALK_AT_HOME_PAGE:
    "check_multi_data_comment_walk_at_home_page",
  GET_TASK_NEED_EXECUTE_BY_URL: "get_task_need_execute_by_url",
  GET_DATA_POST_THIS_BATCH: "get_data_post_this_batch",
  CHECK_CORRECT_URL_COMMENT_WALK: "check_correct_url_comment_walk",
  CHECK_CORRECT_URL_POST_COMMENT_WALK: "check_correct_url_post_comment_walk",
  CHECK_CORRECT_URL_POST_IN_GROUP: "check_correct_url_post_in_group",
  CHECK_CORRECT_URL_GET_LIST_GROUP: "check_correct_url_get_list_group",
  CHECK_IS_SPAMMED_POST: "check_is_spammed_post",
};

const KEY_GOOGLE_API = {
  INFO: {
    MAX_REQUEST_FREE_PER_DAY: 500,
    MAX_TOKEN_PAID_PER_DAY: 200000,
  },
  SETTING: {
    COUNT_REQUEST_FREE_PER_DAY: "count_request_free_per_day_google_api",
    COUNT_TOKEN_PAID_PER_DAY: "count_token_paid_per_day_google_api",
    LAST_TIME_REQUEST_PAID: "last_time_request_paid_google_api",
    CACHED_INPUT: "cached_input_google_api",
    API_KEY_FREE: "api_key_free_google_api",
    API_KEY_PAID: "api_key_paid_google_api",
  },
};

const KEY_FEATURE_FLAG = {
  FIELD: {
    COMMENT_WALK: "comment_walk",
    SPECIAL_FRAME_HOUR: "special_frame_hour",
    IS_RANDOM_BREAK_BATCH: "is_random_break_batch",
    IS_RANDOM_TIME_TASK: "is_random_time_post",
    IS_FIX_STEAL_ALL_FOCUS: "is_fix_steal_all_focus",
    IS_SHUFFLE_SCHEDULER_TIME: "is_shuffle_scheduler_time",
    PRIORITY_TASK: "priority_task",
  },
  STATUS: {
    LOCKED: "LOCKED",
    UNLOCKED: "UNLOCKED",
  },
};

const KEY_LISTENER_UPDATE_REQUEST = "listener_update_request";

const REPLACE_VALUE = {
  IMAGE_MESSAGE: "Tel: 0339.005.642",
  PHONE: "0339 005 642",
};

const KEY_MIGRATE_DATA = {
  IS_MIGATE_DATA_GROUP_POST: "is_migrate_data_group_post",
};

const KEY_DEVICE_ID = "device_id";

const KEY_GET_TOOL_SETTING = "get_tool_setting";

const KEY_STATUS_TOOL = {
  MAINTAINING: "MAINTAINING",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

const KEY_ALL_STATUS = {
  ...KEY_STATUS_TOOL,
  ...KEY_USER_STATUS,
  ...KEY_FEATURE_FLAG.STATUS,
};

const KEY_CACHED_FIREBASE = {
  GET_STATUS_TOOL: "cached_get_status_tool",
  CHECK_OR_REGISTER_DEVICE: "cached_check_or_register_device",
  CHECK_OR_REGISTER_IP: "cached_check_or_register_ip",
  GET_SETTING_TOOL: "cached_get_setting_tool",
};

const KEY_USE_SERVER_NAME = "use_server_name";

const SERVER_NAME = {
  MAIN: "MAIN",
  FIREBASE: "FIREBASE",
};

const KEY_PLATFORM = "DEVICE";

const KEY_CONTINUE_OLD_TASK = "continue_old_task";

export {
  KEY_NOTIFICATION,
  KEY_OPEN_IN_TAB,
  KEY_REGISTER_MENU_COMMAND,
  KEY_UNREGISTER_MENU_COMMAND,
  KEY_XMLHTTP_REQUEST,
  KEY_NOTIFICATION_RESPONSE,
  KEY_OPEN_IN_TAB_RESPONSE,
  KEY_REGISTER_MENU_COMMAND_RESPONSE,
  KEY_UNREGISTER_MENU_COMMAND_RESPONSE,
  KEY_XMLHTTP_REQUEST_RESPONSE,
  KEY_CLOSE_THIS_TAB,
  KEY_CLEAR_NOTIFICATION,
  KEY_GET_LIST_GROUPS,
  KEY_OPEN_DASHBOARD,
  MY_SIGNATURE,
  STATUS_RESPONSE,
  URL_MATCH,
  KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST,
  KEY_UPDATE_STATUS_TASK,
  KEY_NEXT_POST_GROUP,
  KEY_SCHEDULER_ALARMS,
  KEY_CURRENT_WINDOW_ID,
  KEY_UPDATE_IS_SPAMMED,
  KEY_ADD_LOG,
  KEY_FIRST_TIME_USE,
  KEY_GET_KEY_SAVED,
  KEY_SET_KEY_SAVED,
  KEY_CLOSE_THIS_WINDOW,
  KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST,
  KEY_ADD_TIME_DELAY_FOR_SCHEDULER,
  KEY_INTERACT_BEFORE_POST_REQUEST,
  KEY_IS_USE_LOCAL_STORAGE,
  DEFAULT_DEVICE_ID,
  MAX_LENGTH_FILE_NAME,
  KEY_GET_PARSE_FILE,
  KEY_SAVED_TEMP,
  KEY_USER_STATUS,
  KEY_USER_ROLE,
  API_RESPONSE_CODE,
  ERROR_CODE,
  KEY_INDEXED_DB_TABLE_NAME,
  URL_SEARCH_PAGE,
  KEY_CAN_COMMENT_WALK_THIS_TAB,
  KEY_GET_ALL_METADATA_COMMENT_WALK,
  KEY_SET_PROCESSING_COMMENT_WALK,
  KEY_CAN_COMMENT_WALK_THIS_POST,
  KEY_ADD_URL_COMMENTED,
  KEY_COMPLETED_COMMENT_WALK_THIS_BATCH,
  KEY_IMPORT_EXPORT_TYPE,
  KEY_STOP_TASK_REQUEST,
  KEY_COMMENT_WALK_REQUEST,
  KEY_MESSAGE_FROM_BACKGROUND,
  KEY_COMMENT_WALK_AREA,
  KEY_COMMENT_WALK_SPEED,
  KEY_REQUEST_TO_BACKGROUND,
  KEY_GOOGLE_API,
  KEY_FEATURE_FLAG,
  KEY_LISTENER_UPDATE_REQUEST,
  REPLACE_VALUE,
  KEY_GET_PREMIUM,
  KEY_MIGRATE_DATA,
  KEY_DEVICE_ID,
  KEY_GET_TOOL_SETTING,
  KEY_CACHED_FIREBASE,
  KEY_USE_SERVER_NAME,
  SERVER_NAME,
  KEY_STATUS_TOOL,
  KEY_ALL_STATUS,
  KEY_PLATFORM,
  KEY_CONTINUE_OLD_TASK,
};
