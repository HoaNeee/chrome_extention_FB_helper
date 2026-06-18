const SELECTOR = {
  elementsToPost: [`//span[contains(text(), "Write something...")]`],

  elementsPost: [`div[aria-label="Post"][role="button"]`],

  dialog: [`div[role="dialog"][aria-modal]`],

  elementsCloseDialog: [`//div[@aria-label="Close dialog of create tool"]`],

  elementsCreatePost: [`div[aria-label="Create post"][role="dialog"]`],

  elementsTextBoxEditor: [`div[contenteditable="true"][role="textbox"]`],

  elementsSpammed: [
    `//div[contains(text(), "To protect our community from spam, we limit how often you can post, comment, or do other things. Please try again later.")]`,
  ],

  listElementContainers: [`div[aria-label="Preview of a group"][role="main"]`],

  waitingGroups: [`//span[contains(text(),"Request to join group pending")]`],

  allGroupsJoinTexts: [`//span[contains(text(),"All groups you've joined")]`],

  buttonSubmitCommentInGroup: [`div[aria-label="Post comment"][role="button"]`],

  elementsPostedPending: [
    `//span[contains(text(), "Your post is awaiting admin approval. If the admin team approves it it will become visible in the group.")]`,
  ],

  elementsPostedPendingAlert: [
    `//span[contains(text(), "Thanks for your post! It's been submitted to the group admins for approval.")]`,
  ],

  elementLike: `div[aria-label*="React with Like to"]`,
};

const SELECTOR_VI = {
  elementsToPost: [`//span[contains(text(), "Bạn viết gì đi...")]`],

  elementsPost: [`div[aria-label="Đăng"][role="button"]`],

  elementsCreatePost: [`div[aria-label="Tạo bài viết"][role="dialog"]`],

  elementsTextBoxEditor: [`div[contenteditable="true"][role="textbox"]`],

  elementsCloseDialog: ['//div[@aria-label="Đóng hộp thoại của công cụ tạo"]'],

  elementsSpammed: [
    `//div[contains(text(), "Để bảo vệ cộng đồng khỏi spam, chúng tôi giới hạn tần suất bạn đăng bài, bình luận hoặc làm các việc khác trong khoảng thời gian nhất định. Bạn có thể thử lại sau")]`,
  ],

  listElementContainers: [`div[aria-label="Bản xem trước nhóm"]`],

  waitingGroups: [`//span[contains(text(),"Yêu cầu tham gia nhóm đang chờ")]`],

  allGroupsJoinTexts: [
    `//span[contains(text(),"Tất cả các nhóm bạn đã tham gia")]`,
  ],

  buttonSubmitCommentInGroup: [
    `div[aria-label="Đăng bình luận"][role="button"]`,
  ],

  elementsPostedPending: [
    `//span[contains(text(), "Bài đăng của bạn đang chờ quản trị viên phê duyệt. Nếu nhóm quản trị viên chấp thuận, bài đăng sẽ hiển thị trong nhóm.")]`,
  ],

  elementsPostedPendingAlert: [
    `//span[contains(text(), "Cảm ơn bạn đã đăng bài!")]`,
  ],

  elementLike: `div[aria-label*="Bày tỏ cảm xúc Thích về bài viết"]`,
};

const SELECTOR_RAW = {
  listItems: `div[role="listitem"]`,

  toolbarLabel: `div#toolbarLabel`,

  inputFiles: `input[accept][multiple][type="file"]`,

  formToCommentInGroup: [`form[role="presentation"]`],

  textBoxToCommentInGroup: [
    `div[contenteditable="true"][role="textbox"][aria-label][data-lexical-editor=true][spellcheck="true"]`,
  ],
};

export { SELECTOR, SELECTOR_VI, SELECTOR_RAW };
