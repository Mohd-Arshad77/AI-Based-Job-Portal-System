import { useEffect, useState, useRef } from "react";
import { Search, MapPin, Briefcase, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout.jsx";
import JobCard from "../../components/JobCard.jsx";
import { jobsApi } from "../../services/api.js";

const JOB_SUGGESTIONS = [
  "MERN Stack Developer", "MEAN Stack Developer", "Python Developer", 
  "Mobile App Developer", "PHP Developer", "Product Manager",
  "Frontend Developer", "Full Stack Developer", "Flutter Developer",
  "Backend Developer", "Business Analyst", "React Developer", 
  "Ruby on Rails Developer", "UI/UX Designer", "Data Scientist", 
  "DevOps Engineer", "Software Engineer", "Machine Learning Engineer","Golang Developer","Golang"
];

const LOCATION_SUGGESTIONS = [
  "Bangalore, Karnataka","Bengaluru", "Kochi, Kerala", "Trivandrum, Kerala",
  "Kozhikode, Kerala", "Mumbai, Maharashtra", "Pune, Maharashtra",
  "Chennai, Tamil Nadu", "Hyderabad, Telangana", "Delhi NCR",
  "Remote", "Dubai, UAE"
];

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  
  const jobRef = useRef(null);
  const locRef = useRef(null);

  useEffect(() => {
    jobsApi.list()
      .then(({ data }) => {
        const jobsList = data.jobs || data || [];
        setJobs(Array.isArray(jobsList) ? jobsList : []);
      })
      .catch(() => {
        setJobs([]);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (jobRef.current && !jobRef.current.contains(event.target)) setShowJobSuggestions(false);
      if (locRef.current && !locRef.current.contains(event.target)) setShowLocSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredJobSuggestions = JOB_SUGGESTIONS.filter(job => 
    job.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const filteredLocSuggestions = LOCATION_SUGGESTIONS.filter(loc => 
    loc.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 6);

  const filteredJobs = jobs.filter((job) => {
    const skillsString = Array.isArray(job.skillsRequired) ? job.skillsRequired.join(" ") : (job.skillsRequired || "");
    const searchString = `${job.title || ""} ${job.company || ""} ${skillsString}`.toLowerCase();
    const matchesQuery = !query || searchString.includes(query.toLowerCase());

    let matchesLocation = true;
    if (location) {
      const jobLoc = (job.location || "").toLowerCase();
      const searchLoc = location.toLowerCase();
      
      matchesLocation = 
        jobLoc.includes(searchLoc) || 
        searchLoc.includes(jobLoc) ||
        searchLoc.split(',').some(part => part.trim() && jobLoc.includes(part.trim()));
    }

    const isActive = job.isActive !== false;

    return matchesQuery && matchesLocation && isActive;
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (location) params.set("location", location);
    setSearchParams(params, { replace: true });
  }, [query, location, setSearchParams]);

  return (
    <Layout 
      title="Explore Opportunities" 
      subtitle="Browse elite roles tailored to your cognitive profile. Filter by keywords, skills, or location."
    >
      <div className="mb-8 border-b border-slate-200 pb-8 relative z-50">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          
          <div className="md:col-span-6 lg:col-span-7" ref={jobRef}>
            <label htmlFor="search-roles" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Search Roles
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                id="search-roles"
                value={query} 
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowJobSuggestions(true);
                }} 
                onFocus={() => setShowJobSuggestions(true)}
                placeholder="e.g. Senior Software Engineer" 
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600" 
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}

              {showJobSuggestions && query.trim().length > 0 && filteredJobSuggestions.length > 0 && (
                <div className="absolute top-[110%] left-0 w-full bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  {filteredJobSuggestions.map((job, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-sm text-slate-700 transition-colors"
                      onClick={() => {
                        setQuery(job);
                        setShowJobSuggestions(false);
                      }}
                    >
                      <Search size={14} className="text-indigo-400" />
                      {job}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-4" ref={locRef}>
            <label htmlFor="search-location" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                id="search-location"
                value={location} 
                onChange={(event) => {
                  setLocation(event.target.value);
                  setShowLocSuggestions(true);
                }} 
                onFocus={() => setShowLocSuggestions(true)}
                placeholder="e.g. Remote, Bengaluru" 
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600" 
              />
              {location && (
                <button onClick={() => setLocation("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}

              {showLocSuggestions && location.trim().length > 0 && filteredLocSuggestions.length > 0 && (
                <div className="absolute top-[110%] left-0 w-full bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  {filteredLocSuggestions.map((loc, index) => (
                    <div 
                      key={index} 
                      className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-sm text-slate-700 transition-colors"
                      onClick={() => {
                        setLocation(loc);
                        setShowLocSuggestions(false);
                      }}
                    >
                      <MapPin size={14} className="text-indigo-400" />
                      {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 lg:col-span-1">
            <button 
              type="button"
              className="flex h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="md:hidden">Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'result' : 'results'}
        </h2>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-16 text-center">
          <Briefcase className="mb-4 h-10 w-10 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-900">No results found</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Your search criteria didn't return any matches. Try adjusting your filters.
          </p>
          {(query || location) && (
            <button 
              onClick={() => { setQuery(''); setLocation(''); }}
              className="mt-6 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Jobs;