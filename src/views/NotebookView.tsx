import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Pin, BookOpen } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';

export const NotebookView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, setActiveView } = useCashBook();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    addNote({
      title: title.trim() || 'Quick Note',
      content: content.trim(),
    });

    setTitle('');
    setContent('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0288D1] text-white shadow-md">
        <div className="flex items-center justify-between px-3 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('ledger')}
              className="p-2 -ml-1 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Notebook &amp; Reminders</h2>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> New Memo
          </button>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* Create Memo Modal / Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="bg-white p-4 rounded-2xl shadow-sm border border-sky-300 space-y-3 animate-in fade-in"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">Add New Memo</h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Memo Title (e.g. Pending Dues, Order Reminder)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
                autoFocus
              />
            </div>

            <div>
              <textarea
                placeholder="Note details, party contact, amount due..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold"
            >
              Save Memo
            </button>
          </form>
        )}

        {/* Notes Feed */}
        {notes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-600">Notebook is empty</p>
            <p className="text-xs text-slate-400">
              Keep reminders, supplier commitments, and dues recorded here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  note.isDone ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => updateNote(note.id, { isDone: !note.isDone })}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition-colors mt-0.5"
                  >
                    {note.isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <h4
                      className={`font-bold text-sm ${
                        note.isDone ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {note.title}
                    </h4>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">{note.date}</span>
                  </div>

                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Memo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
