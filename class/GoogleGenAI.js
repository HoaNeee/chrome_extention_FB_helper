import {
  API_RESPONSE_CODE,
  ERROR_CODE,
  KEY_GOOGLE_API,
} from "../contants/constant-extention.js";
import { addLog } from "../dashboard/src/draw_element/panel-log.js";
import { commentWalkService } from "../services/comment-walk-service.js";
import { getIsDeveloperModeInStorage } from "../services/storage-service.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { CustomError } from "../utils/exception.js";
import { getTextWithLanguage, hashString } from "../utils/utils.js";
import CommentWalk from "./CommentWalk.js";

/**
 * @typedef {Object} CandidateType
 * @property {{parts: {text: string}[], role: string}} content
 * @property {string} finishReason
 * @property {number} index
 *
 */

/**
 * @typedef {Object} MetadataUsageType
 * @property {number} candidatesTokenCount
 * @property {number} promptTokenCount
 * @property {number} totalTokenCount
 */

/**
 * @typedef {Object} ResponseAgentAPI
 * @property {CandidateType[]} candidates
 * @property {string} modelVersion
 * @property {string} responseId
 * @property {MetadataUsageType} usageMetadata
 */

const arrDataGroup = [
  {
    id: 1,
    key_1: "Đống đa, tôn đức thắng",
    key_2: "studio, 5tr, thang máy",
  },
  {
    id: 2,
    key_1: "Mễ trì, mỹ đình",
    key_2: "4tr",
  },
  {
    id: 3,
    key_1: "Đình thôn, mỹ đình",
    key_2: "3tr, gác xếp",
  },
  {
    id: 5,
    key_1: "Cầu giấy",
    key_2: "5tr, có gác xếp",
  },
  {
    id: 6,
    key_1: "Cầu giấy, thương mại, hồ tùng mậu",
    key_2: "studio, 2tr",
  },
  {
    id: 4,
    key_1: "Hà đông",
    key_2: "4tr, studio",
  },
];

const listContent = [
  {
    title:
      "Tìm Phòng Trọ Triều Khúc, Tân Triều, Yên Xá, Văn Quán, Phùng Khoang, Thanh Xuân",
    content: `4,5 tr ít quá không các bác? Sao xem phòng 4,5 tr cầu giấy hoặc gần dhsp mà toàn phòng lạ lắm, nhét thêm cái bồn rửa chén trơ khung bán giá tsudio là như nào? `,
  },
  {
    title: "Phòng Trọ Cầu Giấy - Hồ Tùng Mậu - Mỹ Đình - Cầu Diễn - Nhổn",
    content: `Bao gồm 4 phòng studio full đồ, tầng 2, diện tích rộng 30m2, gác lửng, có ban công thoáng mát, nội thất mới tinh, giá 4,5tr/th. Full đồ có máy giặt riêng, bếp từ, tủ lạnh, điều hoà, bình nóng lạnh, tủ quần áo, giường. Có sân rộng để xe ô tô, xe máy riêng biệt; khu an ninh, gần Aeon Hà Đông, tiện ích đầy đủ, không chung chủ. Liên hệ: 0962374735`,
  },

  {
    title: "Phòng Trọ Cầu Giấy - Hồ Tùng Mậu - Mỹ Đình - Cầu Diễn - Nhổn",
    content: `Ai cần tìm phòng khu vực Cầu giấy thì có thể tham khảo phòng ở 79 Cầu Giấy nhà mình nhé, phòng full nội thất, lh: 0987654321`,
  },
  {
    title: "Thuê Phòng Trọ Yên Hòa - Cầu Giấy",
    content:
      "Mình cần tìm phòng quanh kv yên hoà tài chính 1-2tr, không gác xếp",
  },
  {
    title:
      "Phòng Trọ Ngã Tư Sở, Trường Chinh, Đường Láng, Tây Sơn, Thái Thịnh, Thái Hà",
    content:
      "Nhà số 42 ngõ 143/45 xuân phương sinh viên ở 1 người 350k tiền nước nước 3tr5 tiền điện cọc 4tr2 trả cọc 143k😳",
  },
  {
    title: "NHÀ TRỌ KHU VỰC CẦU GIẤY",
    content: `mình cần tìm phòng trọ hoặc chung cư mini khu vực gần ĐH Thương Mại có giá từ 3 đến 4,5🍠`,
  },
];

export class GoogleGenAIClass {
  constructor() {
    this.model = "gemini-3.1-flash-lite";
    this.key = KEY_GOOGLE_API.SETTING.API_KEY_PAID;
    this.key_free = KEY_GOOGLE_API.SETTING.API_KEY_FREE;
  }

  async test() {
    try {
      /**
       * Rule như sau
       * + Có thể để các layer trước loại bỏ khu vực, sau đó chỉ so sánh các tiện ích, tài chính để giảm tải chi phí
       * + Không thì layer khu vực sẽ được so sánh luôn, chi phí sẽ cao hơn, có thể làm chế độ nghiêm ngặt hơn (cân nhăc)
       */

      const obj = listContent[4];

      const content = obj.content;

      const titleGroup = obj.title;

      const dataCommentWalk = {
        keywords_certain_choice: ["Cầu giấy", "GTVT", "ngoại thương"],
        keyword_query_includes: ["2n1k", "9tr"],
      };

      console.log(titleGroup);
      console.log(content);

      // const match = await this.matchCommentWalkAtSearchPage(
      //   dataCommentWalk,
      //   content,
      //   titleGroup,
      // );

      // console.log(match);

      const list = await commentWalkService.getListCommentWalk();

      const listMatch = await this.matchMultiCommentWalkHomePage(
        list,
        content,
        titleGroup,
      );

      console.log(listMatch);
    } catch (error) {
      console.log("Error at GoogleGenAIClass test: ", error);
    }
  }

  /**
   *
   * @param {Array<CommentWalk>} listCommentWalk
   * @param {string} contentPost
   * @param {string} titleGroup
   * @returns {Promise<Array<{id: string, score: number, match: string[]} | null>>}
   */
  async matchMultiCommentWalkHomePage(
    listCommentWalk,
    contentPost,
    titleGroup,
  ) {
    try {
      const rule = `
      Bạn là hệ thống phân loại bài viết bất động sản.
      Nhiệm vụ: Xác định nội dung bài viết mà người dùng cung cấp chính xác là TÌM_PHÒNG hay CHO_THUÊ.
      - CHO_THUÊ: Chủ nhà/môi giới/người nhượng phòng/cho thuê bất cứ thứ gì (có phòng trống, giá, địa chỉ, SĐT,..). -> Trả về mảng chỉ có duy nhất một phần tử dạng [{id: "0", is_match: false, score: 0}], không cần xét thêm và không cần giải thích gì thêm
      - TÌM_PHÒNG: Người đang đi tìm/thuê phòng (cần tìm, tài chính, tc, khu vực,..). -> So khớp (hoặc so sánh theo suy nghĩ của bạn) các từ khóa địa điểm/khu vực,..., các từ khóa bổ sung như tài chính/tiện ích,..., nội dung bài viết có thể phù hợp với dữ liệu (có thể nếu điểm cao) thì true
      
      - Dữ liệu cung cấp nếu bài viết là kiểu TÌM_PHÒNG sẽ bao gồm một danh sách các phần tử có thuộc tính: 
        + ID: ID của dữ liệu
        + keywords_1: Các từ khóa địa điểm, khu vực,...
        + keywords_2: Các từ khóa tiện ích, giá phòng,...
        + optional_rule: Các luật bổ sung thêm
      `;

      const info = listCommentWalk
        .map((l) => {
          return `{ID: ${l.id},\nkeywords_1: ${l.keywords_certain_choice.join(", ")},\nkeywords_2: ${l.keyword_query_includes.join(", ")}\noptional_rule: ${l.description_for_ai ? l.description_for_ai : "Không có luật bổ sung"}}`;
        })
        .join("\n");

      const input = `Dữ liệu cung cấp:\n${info}\n===========\nTiêu đề nhóm (phụ trợ thêm nếu trong nội dung bài viết không chứa từ khóa): ${titleGroup}\n============\nNội dung bài viết: ${contentPost}
        `;

      const rule2 = `
Bạn là hệ thống kiểm tra bài viết.
- Quy tắc: Bài CHO_THUÊ -> return {list_match: [{id: "0", is_match: false, score: 0}]}. Bài TÌM_PHÒNG -> So sánh các tiêu chí, tìm ra những dữ liệu phù hợp.

VÍ DỤ MẪU:
  Tiêu chuẩn tìm kiếm
    + ID: 10
    + Địa điểm, khu vực: Cầu giấy, GTVT
    + Giá phòng, tiện ích: 9tr, 2n1k

  Input: "Cho thuê phòng Cầu Giấy 3.5tr"
  is_match: false
  Giải thích: bài CHO_THUÊ

  Input: "Tìm phòng khu vực Cầu Giấy 3.5tr"
  is_match: false
  Giải thích: bài TÌM_PHÒNG nhưng tài chính quá xa so với tiêu chuẩn

  Input: "Tìm phòng khu vực Cầu Giấy 8 - 10tr"
  is_match: true
  Giải thích: bài TÌM_PHÒNG, tài chính nằm trong khoảng chấp nhận được so với tiêu chuẩn

Dữ liệu cung cấp nếu bài viết là kiểu TÌM_PHÒNG sẽ bao gồm một danh sách các phần tử có thuộc tính: 
  + ID: ID của dữ liệu
  + keywords_1: Các từ khóa địa điểm, khu vực,...
  + keywords_2: Các từ khóa tiện ích, giá phòng,...
  + optional_rule: Các luật bổ sung thêm

Đây là dữ liệu các tiêu chí:
${info}`;

      const input2 = `Tiêu đề nhóm (phụ trợ thêm nếu trong nội dung bài viết không đề cập đến địa điểm, khu vực,...): ${titleGroup}\n============\nNội dung bài viết: ${contentPost}`;

      const schema = {
        type: "object",
        properties: {
          list_match: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                is_match: { type: "boolean" },
                score: {
                  type: "number",
                  description: "Điểm tương đồng từ 0.0 đến 1.0",
                },
              },
              required: ["id", "is_match", "score"],
            },
          },
        },
      };

      console.log(input2);

      console.log(rule2);

      const result = await this.request(rule2, input2, schema);

      console.log(result);

      const text = result.candidates[0].content.parts[0].text;

      const data = JSON.parse(text);

      const list_match = data?.list_match;

      if (!list_match) {
        return null;
      }

      const filtered = list_match.filter((i) => i.is_match);

      if (!filtered || filtered.length === 0) {
        return null;
      }

      return filtered.map((i) => {
        return {
          id: i.id,
          score: i.score * 10,
          match: ["Use AI Help"],
        };
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   *
   * @param {CommentWalk} dataCommentWalk
   * @param {string} contentPost
   * @param {string} titleGroup
   * @return {Promise<boolean>}
   */
  async matchCommentWalkAtSearchPage(dataCommentWalk, contentPost, titleGroup) {
    try {
      const isDevMode = await getIsDeveloperModeInStorage();
      if (!isDevMode) {
        const cached = await this.getCachedInputByValue(contentPost);
        if (cached !== null && cached !== undefined) return cached;
      }

      const rule = `
      Bạn là hệ thống phân loại bài viết bất động sản.
      Nhiệm vụ: Xác định nội dung bài viết mà người dùng cung cấp chính xác là TÌM_PHÒNG hay CHO_THUÊ.
      - CHO_THUÊ: Chủ nhà/môi giới/người nhượng phòng/cho thuê bất cứ thứ gì (có phòng trống, giá, địa chỉ, SĐT,..). -> Trả về false
      - TÌM_PHÒNG: Người đang đi tìm/thuê phòng (cần tìm, tài chính, tc, khu vực,..). -> So khớp (hoặc theo suy nghĩ của bạn) các từ khóa địa điểm/khu vực,... 
          So khớp các từ khóa như tiện ích, giá phòng,..., giá phòng phải trong khoảng phù hợp với người tìm phòng, tiện ích cũng như vậy, hãy suy nghĩ chính xác.
      `;

      const info = `{
        - Các từ khóa có chứa địa điểm, khu vực,...: ${dataCommentWalk.keywords_certain_choice.join(", ")}
        - Các từ khóa có chứa tiện ích, giá phòng,...: ${dataCommentWalk.keyword_query_includes.join(", ")}
      }`;

      const input = `Dữ liệu người dùng cung cấp:\n${info}\n===========\nTiêu đề nhóm (phụ trợ thêm nếu trong nội dung bài viết không chứa từ khóa): ${titleGroup}\n============\nNội dung bài viết: ${contentPost}`;

      const rule2 = `
        Bạn là hệ thống kiểm tra bài viết.
        - Tiêu chuẩn tìm kiếm cố định:
          + Địa điểm, khu vực,...: ${dataCommentWalk.keywords_certain_choice.join(", ")}
          + Giá phòng, tiện ích,...: ${dataCommentWalk.keyword_query_includes.join(", ")}
          ${dataCommentWalk.description_for_ai ? `+ Luật bổ sung cho bạn: ${dataCommentWalk.description_for_ai}` : ""}
        - Quy tắc: Bài CHO_THUÊ -> return false. Bài TÌM_PHÒNG -> So sánh.

        VÍ DỤ MẪU:
        Tiêu chuẩn tìm kiếm
          + Địa điểm, khu vực: Cầu giấy, GTVT
          + Giá phòng, tiện ích: 9tr, 2n1k

        Input: "Cho thuê phòng Cầu Giấy 3.5tr"
        Output: false
        Giải thích: bài CHO_THUÊ

        Input: "Tìm phòng khu vực Cầu Giấy 3.5tr"
        Output: false
        Giải thích: bài TÌM_PHÒNG nhưng tài chính quá xa so với tiêu chuẩn

        Input: "Tìm phòng khu vực Cầu Giấy 8 - 10tr"
        Output: true
        Giải thích: bài TÌM_PHÒNG, tài chính nằm trong khoảng chấp nhận được so với tiêu chuẩn
      `;

      const input2 = `
        Tiêu đề nhóm (phụ trợ thêm về địa điểm nếu trong nội dung bài viết không đề cập đến địa điểm, khu vực): ${titleGroup}
        Nội dung bài viết: ${contentPost}
      `;

      const schema = {
        type: "boolean",
      };

      console.log(rule2);

      this.log("Input", input2);

      const result = await this.request(rule2, input2, schema);

      this.log("Result", result);

      const text = result.candidates[0].content.parts[0].text;

      const parse = JSON.parse(text);

      if (!isDevMode) {
        await this.cachedInputInStorage(contentPost, parse);
      }

      return parse;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   *
   * @param {string} rule
   * @param {string} input
   * @param {Object} schema
   * @returns {Promise<ResponseAgentAPI>}
   */
  async request(
    rule,
    input,
    schema,
    key_param = this.key_free,
    max_request = 0,
    is_count_request = true,
    is_count_token = false,
  ) {
    const isLimitToken = await this.checkLimitTokenPaidPerDay();
    const isLimitRequest = await this.checkLimitRequestFreePerDay();
    const isNewDay = await this.checkNewDay();

    this.log("Is new day", isNewDay);

    if (isNewDay) {
      await this.clearCachedInput();
    }

    if (isLimitRequest || isLimitToken) {
      if (isNewDay) {
        await this.resetRequestFreePerDay();
        await this.resetTokenPaidPerDay();
      } else {
        if (isLimitRequest) {
          throw new CustomError(
            429,
            getTextWithLanguage({
              vi: "Đã hết lượt gọi miễn phí, chuyển qua gói trả phí",
              en: "You have used up all requests, switch to paid plan",
            }),
          );
        }
        throw new CustomError(
          400,
          getTextWithLanguage({
            vi: "Bạn đã hết lượt sử dụng",
            en: "You have used up all requests",
          }),
        );
      }
    }

    const body = {
      systemInstruction: {
        parts: [{ text: rule }],
      },
      // 2. Nội dung cần so sánh
      contents: [
        {
          parts: [
            {
              text: input,
            },
          ],
        },
      ],
      // 3. Cấu hình bắt buộc Gemini trả về JSON chuẩn
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.0,
      },
    };

    const url = this.getUrl(key_param);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      //type error
      //code
      //message
      //status
      if (result?.error) {
        const error = result.error;
        this.log("Error from GoogleGenAI", error);
        throw new CustomError(
          error.code || 400,
          error.message || "",
          "GoogleGenAIClass",
        );
      }

      if (is_count_token) {
        const totalTokenCount = result.usageMetadata.totalTokenCount;
        await this.updateCountTokenPaidPerDay(totalTokenCount);
      }

      if (is_count_request) {
        await this.updateCountRequestFreePerDay(1);
      }

      await this.updateLastTimeRequest();

      return result;
    } catch (error) {
      this.log("Error from GoogleGenAI", error);

      if (max_request < 2) {
        addLog({
          vi: "Dịch vụ AI API miễn phí gặp sự cố, đang thử chuyển sang API trả phí...",
          en: "AI service is having trouble, trying to switch to paid API...",
        });
        return await this.request(
          rule,
          input,
          schema,
          this.key,
          max_request + 1,
          false,
          true,
        );
      }

      addLog({
        vi: "Dịch vụ AI không khả dụng",
        en: "AI service is not available",
      });

      throw error;
    }
  }

  getUrl(key_param) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${key_param}`;
  }

  async updateCountTokenPaidPerDay(count) {
    try {
      const currentCount = await this.getCountTokenPaidPerDay();
      await DB_setValue(
        KEY_GOOGLE_API.SETTING.COUNT_TOKEN_PAID_PER_DAY,
        count + currentCount,
      );
    } catch (error) {
      addLog({
        vi: "Lỗi khi cập nhật số token paid",
        en: "Error updating token paid count",
      });
      console.log(error);
    }
  }

  async getCountTokenPaidPerDay() {
    return await DB_getValue(
      KEY_GOOGLE_API.SETTING.COUNT_TOKEN_PAID_PER_DAY,
      0,
    );
  }

  async updateCountRequestFreePerDay(count) {
    try {
      const currentCount = await this.getCountRequestFreePerDay();
      await DB_setValue(
        KEY_GOOGLE_API.SETTING.COUNT_REQUEST_FREE_PER_DAY,
        count + currentCount,
      );
    } catch (error) {
      addLog({
        vi: "Lỗi khi cập nhật số request free",
        en: "Error updating request free count",
      });
      console.log(error);
    }
  }

  async getCountRequestFreePerDay() {
    return await DB_getValue(
      KEY_GOOGLE_API.SETTING.COUNT_REQUEST_FREE_PER_DAY,
      0,
    );
  }

  async checkLimitRequestFreePerDay() {
    const count = await this.getCountRequestFreePerDay();
    if (count >= KEY_GOOGLE_API.INFO.MAX_REQUEST_FREE_PER_DAY) {
      return true;
    }
    return false;
  }

  async checkLimitTokenPaidPerDay() {
    const count = await this.getCountTokenPaidPerDay();
    if (count >= KEY_GOOGLE_API.INFO.MAX_TOKEN_PAID_PER_DAY) {
      return true;
    }
    return false;
  }

  async resetRequestFreePerDay() {
    await DB_setValue(KEY_GOOGLE_API.SETTING.COUNT_REQUEST_FREE_PER_DAY, 0);
  }

  async resetTokenPaidPerDay() {
    await DB_setValue(KEY_GOOGLE_API.SETTING.COUNT_TOKEN_PAID_PER_DAY, 0);
  }

  async updateLastTimeRequest() {
    const date = new Date().getTime();
    await DB_setValue(KEY_GOOGLE_API.SETTING.LAST_TIME_REQUEST_PAID, date);
  }

  async getLastTimeRequest() {
    return await DB_getValue(
      KEY_GOOGLE_API.SETTING.LAST_TIME_REQUEST_PAID,
      null,
    );
  }

  async checkNewDay() {
    const lastTimeRequest = await this.getLastTimeRequest();
    if (!lastTimeRequest) {
      return true;
    }
    const lastTimeDate = new Date(lastTimeRequest).getDate();
    const now = new Date().getDate();
    if (now > lastTimeDate) {
      return true;
    }
    return false;
  }

  /**
   *
   * @returns {Promise<Array<{key: string, value: Object}>>}
   */
  async getCachedInput() {
    return await DB_getValue(KEY_GOOGLE_API.SETTING.CACHED_INPUT, []);
  }

  async cachedInputInStorage(key, res) {
    try {
      const cachedInput = await this.getCachedInput();
      const hash = await hashString(key);
      if (cachedInput.find((item) => item.key === hash)) {
        return;
      }
      cachedInput.push({ key: hash, value: res });
      await DB_setValue(KEY_GOOGLE_API.SETTING.CACHED_INPUT, cachedInput);
    } catch (error) {
      addLog({
        vi: "Lỗi khi caching input",
        en: "Error caching input",
      });
      console.log(error);
    }
  }

  /**
   *
   * @param {string} key
   * @returns {Promise<any | null>}
   */
  async getCachedInputByValue(key) {
    try {
      const cachedInput = await this.getCachedInput();
      const hash = await hashString(key);
      const cached = cachedInput.find((item) => item.key === hash);
      return cached ? cached.value : null;
    } catch (error) {
      addLog({
        vi: "Lỗi khi get cached input",
        en: "Error getting cached input",
      });
      console.log(error);
      return null;
    }
  }

  async clearCachedInput() {
    try {
      await DB_setValue(KEY_GOOGLE_API.SETTING.CACHED_INPUT, []);
    } catch (error) {
      addLog({
        vi: "Lỗi khi clear cached input",
        en: "Error clearing cached input",
      });
      console.log(error);
    }
  }

  /**
   * get api key gemini free from storage
   */
  static async getApiKeyGeminiFree() {
    try {
      const apiKey = await DB_getValue(KEY_GOOGLE_API.SETTING.API_KEY_FREE, "");
      return apiKey;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * get api key gemini paid from storage
   */
  static async getApiKeyGeminiPaid() {
    try {
      const apiKey = await DB_getValue(KEY_GOOGLE_API.SETTING.API_KEY_PAID, "");
      return apiKey;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * set api key gemini free to storage
   * @param {string} apiKey
   */
  static async setApiKeyGeminiFree(apiKey) {
    try {
      await DB_setValue(KEY_GOOGLE_API.SETTING.API_KEY_FREE, apiKey);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * set api key gemini paid to storage
   * @param {string} apiKey
   */
  static async setApiKeyGeminiPaid(apiKey) {
    try {
      await DB_setValue(KEY_GOOGLE_API.SETTING.API_KEY_PAID, apiKey);
    } catch (error) {
      console.log(error);
    }
  }

  log(...args) {
    console.log(...args);
  }
}
