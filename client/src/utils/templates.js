// Frontend templates - importing from server utils
// Note: In a real production app, you might want to duplicate this on the frontend
// or create a shared package for templates

const queryTemplate = ({
  country,
  city,
  location,
  type,
  priceMin,
  priceMax,
  timeRange,
  additional,
}) => {
  let parts = ["Find homes"];

  if (country || city) {
    let locationStr = [country, city].filter(Boolean).join(", ");
    if (locationStr) parts.push(`in ${locationStr}`);
  }

  if (location) {
    parts.push(`(specific location: ${location})`);
  }

  if (type) {
    parts.push(`of type "${type}"`);
  }

  if (priceMin || priceMax) {
    let priceStr = "with price";
    if (priceMin && priceMax) {
      priceStr += ` between $${priceMin} and $${priceMax}`;
    } else if (priceMin) {
      priceStr += ` from $${priceMin}`;
    } else if (priceMax) {
      priceStr += ` up to $${priceMax}`;
    }
    parts.push(priceStr);
  }

  if (timeRange) {
    parts.push(`available in the time range: ${timeRange}`);
  }

  let query = parts.join(" ") + ".";

  if (additional) {
    query += ` Additional requirements: ${additional}`;
  }

  return query.trim();
};

export default queryTemplate;