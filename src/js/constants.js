export const GROUPED_NONE = 0;
export const GROUPED_BY_TYPE = 1;
export const GROUPED_BY_COLLECTION = 2;
export const CHILD_NOTES = Symbol.for('childNotes');
export const CHILD_ATTACHMENTS = Symbol.for('childAttachments');
export const CHILD_OTHER = Symbol.for('childOther');
export const GROUP_EXPANDED_SUMBOL = Symbol.for('groupExpanded');
export const GROUP_TITLE = Symbol.for('groupTitle');
export const VIEW_ONLINE_URL = Symbol.for('viewOnlineUrl');
export const ABSTRACT_NOTE_PROCESSED = Symbol.for('abstractNoteProcessed');
export const AUTHORS_SYMBOL = Symbol.for('authors');
export const FORMATTED_DATE_SYMBOL = Symbol.for('formattedDate');
export const HAS_PDF = Symbol.for('hasPdf');

export default {
	GROUPED_NONE, GROUPED_BY_TYPE, GROUPED_BY_COLLECTION, CHILD_NOTES, CHILD_ATTACHMENTS,
	CHILD_OTHER, GROUP_EXPANDED_SUMBOL, GROUP_TITLE, VIEW_ONLINE_URL, ABSTRACT_NOTE_PROCESSED,
	AUTHORS_SYMBOL, FORMATTED_DATE_SYMBOL, HAS_PDF
};
