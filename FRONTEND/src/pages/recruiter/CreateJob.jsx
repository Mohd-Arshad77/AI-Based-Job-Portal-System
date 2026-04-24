import React from "react";

function CreateJob({ createForm, setCreateForm, handleCreateJob, createMessage, user }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-10">
        <div className="border-b border-gray-200 pb-5 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create New Job Posting</h2>
          <p className="text-sm text-gray-500 mt-1">Fill out the details below to publish a new open role.</p>
        </div>

        <form onSubmit={handleCreateJob} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Job Title <span className="text-rose-500">*</span></label>
              <input required className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. Senior Backend Engineer" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder={user?.company || "Company Ltd"} value={createForm.company} onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. Remote, San Francisco" value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Job Type</label>
              <select className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Contract</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Compensation</label>
              <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. $100k - $130k" value={createForm.salary} onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Required Skills</label>
              <input className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. React, Node.js, MongoDB (comma separated)" value={createForm.skillsRequired} onChange={(e) => setCreateForm({ ...createForm, skillsRequired: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Detailed Description</label>
              <textarea rows="6" className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 outline-none resize-y" placeholder="Detail the role, expectations, and requirements..." value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            {createMessage && <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md">{createMessage}</span>}
            <button type="submit" className="ml-auto px-8 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJob;