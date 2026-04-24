import React from "react";
import { Calendar } from "lucide-react";

function InterviewsTab({
  scheduledInterviews,
  availableInterviewApplications,
  interviewForm,
  setInterviewForm,
  handleScheduleInterview,
  isSchedulingInterview,
  interviewFeedback,
  formatInterviewDate,
  formatInterviewTime
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Interviews Schedule</h2>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
          {scheduledInterviews.length} Scheduled
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Schedule New Interview</h3>
            <p className="text-sm text-gray-500 mt-1">Select a shortlisted candidate to arrange a meeting.</p>
          </div>
          {!availableInterviewApplications.length && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">No Shortlisted Candidates</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Candidate</label>
            <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.applicationId} onChange={(e) => setInterviewForm({ ...interviewForm, applicationId: e.target.value })}>
              {availableInterviewApplications.length ? availableInterviewApplications.map((app) => (
                <option key={app._id} value={app._id}>{app.user?.name} ({app.job?.title})</option>
              )) : <option value="">No available candidates</option>}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Date & Time</label>
            <input type="datetime-local" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Meeting Mode</label>
            <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}>
              <option>Video Call</option>
              <option>Phone</option>
              <option>Onsite</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-sm font-medium text-gray-700">Link / URL</label>
            <input type="url" placeholder="e.g. meet.google.com/..." className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.meetingLink} onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-sm font-medium text-gray-700">Location (If Onsite)</label>
            <input type="text" placeholder="Office / Floor / Room" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">Interview Notes</label>
            <textarea rows="2" placeholder="Instructions or preparation notes..." className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none resize-y" value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={handleScheduleInterview} disabled={!availableInterviewApplications.length || isSchedulingInterview} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSchedulingInterview ? "Scheduling..." : "Schedule Interview"}
          </button>
        </div>

        {interviewFeedback.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium border ${interviewFeedback.type === "error" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
            {interviewFeedback.text}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
        {scheduledInterviews.length ? (
          <ul className="divide-y divide-gray-200">
            {scheduledInterviews.map((interview) => (
              <li key={interview._id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 border border-gray-200">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">{interview.user?.name || "Candidate Name"}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{interview.job?.title || "Role Unspecified"}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-700 mt-2 font-medium">
                        <span className="text-indigo-600">{formatInterviewDate(interview.scheduledAt)}</span>
                        <span>&bull;</span>
                        <span>{formatInterviewTime(interview.scheduledAt)}</span>
                        <span>&bull;</span>
                        <span className="text-gray-500">{interview.mode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {interview.location && <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs font-medium text-gray-700">{interview.location}</span>}
                    {interview.meetingLink && (
                      <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                        Join Call
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center">
            <Calendar className="h-8 w-8 text-gray-300 mb-3" />
            No upcoming interviews.
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewsTab;