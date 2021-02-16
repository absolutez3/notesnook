import Collection from "./collection";
import Notebook from "../models/notebook";
import sort from "fast-sort";
import getId from "../utils/id";
import { CHECK_IDS, sendCheckUserStatusEvent } from "../common";
import { qclone } from "qclone";

export default class Notebooks extends Collection {
  async add(notebookArg) {
    if (!notebookArg) throw new Error("Notebook cannot be undefined or null.");

    if (notebookArg.remote) {
      return await this._collection.addItem(notebookArg);
    }

    //TODO reliably and efficiently check for duplicates.
    const id = notebookArg.id || getId();
    let oldNotebook = this._collection.getItem(id);

    if (
      !oldNotebook &&
      this.all.length >= 3 &&
      !(await sendCheckUserStatusEvent(CHECK_IDS.notebookAdd))
    )
      return;

    if (!oldNotebook && !notebookArg.title)
      throw new Error("Notebook must contain at least a title.");

    let notebook = {
      ...oldNotebook,
      ...notebookArg,
    };

    notebook = {
      id,
      type: "notebook",
      title: notebook.title,
      description: notebook.description,
      dateCreated: notebook.dateCreated,
      dateEdited: notebook.dateEdited,
      pinned: !!notebook.pinned,
      topics: notebook.topics || [],
      totalNotes: notebook.totalNotes || 0,
    };
    if (
      !oldNotebook &&
      notebook.topics.findIndex((topic) => topic.title === "General") <= -1
    ) {
      notebook.topics.splice(0, 0, "General");
    }

    await this._collection.addItem(notebook);

    if (!oldNotebook) {
      await this.notebook(notebook).topics.add(...notebook.topics);
    }
    return id;
  }

  get raw() {
    return this._collection.getRaw();
  }

  get all() {
    return sort(this._collection.getItems()).desc((t) => t.pinned);
  }

  get pinned() {
    return this.all.filter((item) => item.pinned === true);
  }

  get deleted() {
    return this.raw.filter((item) => item.dateDeleted > 0);
  }

  /**
   *
   * @param {string} id The id of the notebook
   * @returns {Notebook} The notebook of the given id
   */
  notebook(id) {
    let notebook = id.type ? id : this._collection.getItem(id);
    if (!notebook || notebook.deleted) return;
    return new Notebook(notebook, this._db);
  }

  async delete(...ids) {
    for (let id of ids) {
      let notebook = this.notebook(id);
      if (!notebook) continue;
      const notebookData = qclone(notebook.data);
      await notebook.topics.delete(...notebook.data.topics);
      await this._collection.removeItem(id);
      await this._db.settings.unpin(id);
      await this._db.trash.add(notebookData);
    }
  }
}
