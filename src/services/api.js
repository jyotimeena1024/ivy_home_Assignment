const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solve.ivy.homes';
const API_KEY = import.meta.env.VITE_API_KEY || 'IVY26-802362255C00';

function getAuthHeader() {
  const token = localStorage.getItem('ivy_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const errorMsg = (data && data.detail) || res.statusText || 'API Request Failed';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
  return data;
}

// 1. Auth Service
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function refreshAuthToken(refreshToken) {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  return handleResponse(res);
}

// Helper: Normalize carpet_area for MagicHomes (sq.m to sq.ft)
export function normalizeListing(listing) {
  if (!listing) return listing;
  const isMagicHomes = listing.website === 'magichomes';
  const carpetAreaSqFt = isMagicHomes && listing.carpet_area
    ? Math.round(listing.carpet_area * 10.7639)
    : listing.carpet_area;

  const pricePerSqFt = (listing.price > 0 && carpetAreaSqFt > 0)
    ? Math.round(listing.price / carpetAreaSqFt)
    : null;

  return {
    ...listing,
    carpet_area_raw: listing.carpet_area,
    carpet_area_sqft: carpetAreaSqFt,
    price_per_sqft: pricePerSqFt,
    unit_is_sqm: isMagicHomes
  };
}

// 2. Listings Service
export async function getListings({ limit = 20, offset = 0 } = {}) {
  const res = await fetch(`${BASE_URL}/v1/listings?limit=${limit}&offset=${offset}`, {
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  const data = await handleResponse(res);
  if (data && data.results) {
    data.results = data.results.map(normalizeListing);
  }
  return data;
}

export async function getListingById(id) {
  const res = await fetch(`${BASE_URL}/v1/listings/${id}`, {
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  const data = await handleResponse(res);
  return normalizeListing(data);
}

// 3. Rentals Service
export async function getRentals({ limit = 20, offset = 0 } = {}) {
  const res = await fetch(`${BASE_URL}/v1/rentals?limit=${limit}&offset=${offset}`, {
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  return handleResponse(res);
}

export async function getRentalById(id) {
  const res = await fetch(`${BASE_URL}/v1/rentals/${id}`, {
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  return handleResponse(res);
}

// 4. Projects Service
export function normalizeProject(project) {
  if (!project) return project;
  // Convert price_min and price_max from Lakhs to raw INR
  const minInr = project.price_min != null ? Math.round(project.price_min * 100000) : null;
  const maxInr = project.price_max != null ? Math.round(project.price_max * 100000) : null;

  return {
    ...project,
    price_min_lakhs: project.price_min,
    price_max_lakhs: project.price_max,
    price_min_inr: minInr,
    price_max_inr: maxInr
  };
}

export async function getProjects({ limit = 20, offset = 0 } = {}) {
  const res = await fetch(`${BASE_URL}/v1/projects?limit=${limit}&offset=${offset}`, {
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  const data = await handleResponse(res);
  if (data && data.results) {
    data.results = data.results.map(normalizeProject);
  }
  return data;
}

export async function getProjectById(id) {
  const res = await fetch(`${BASE_URL}/v1/projects/${id}`, {
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  const data = await handleResponse(res);
  return normalizeProject(data);
}

// 5. Saved / Favourites Service (Actual Endpoint: /v1/saved)
export async function getSavedListings() {
  const res = await fetch(`${BASE_URL}/v1/saved`, {
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  const data = await handleResponse(res);
  if (data && data.results) {
    data.results = data.results.map(normalizeListing);
  }
  return data;
}

export async function addSavedListing(listingId) {
  const res = await fetch(`${BASE_URL}/v1/saved`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ listing_id: listingId })
  });
  return handleResponse(res);
}

export async function removeSavedListing(listingId) {
  const res = await fetch(`${BASE_URL}/v1/saved/${listingId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
      ...getAuthHeader()
    }
  });
  return handleResponse(res);
}
