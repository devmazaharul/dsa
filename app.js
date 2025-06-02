const  express=require("express")
const axios=require("axios")
const cheerio =require("cheerio")
const app = express();
const port = process.env.PORT || 4041;

// extractMedia ফাংশন
async function extractMedia(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const images = [];
    const videos = [];

    // Extract image src
    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        // আপেক্ষিক URL কে সম্পূর্ণ URL এ রূপান্তর
        images.push(src.startsWith("http") ? src : new URL(src, url).href);
      }
    });

    // Extract video src from <video> tag
    $("video").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        // আপেক্ষিক URL কে সম্পূর্ণ URL এ রূপান্তর
        videos.push(src.startsWith("http") ? src : new URL(src, url).href);
      }
    });

    // Extract source inside <video> or <picture> tags (e.g., <source src="video.mp4">)
    $("source").each((i, el) => {
      const src = $(el).attr("src");
      const type = $(el).attr("type"); // Get type attribute to check if it's a video source
      
      // Basic check for video file extensions or common video types
      if (src && (src.endsWith(".mp4") || src.endsWith(".webm") || src.endsWith(".ogg") || (type && type.startsWith("video/")))) {
        // আপেক্ষিক URL কে সম্পূর্ণ URL এ রূপান্তর
        videos.push(src.startsWith("http") ? src : new URL(src, url).href);
      }
    });

    return { images, videos };

  } catch (err) {
    console.error("❌ Error fetching URL:", err?.message);
    return undefined;
  }
}

app.get("/scrape", async (_req, res) => {
  const targetUrl =  "https://newmazaharul.vercel.app/"
  
  if (!targetUrl) {
    return res.status(400).json({ error: "Please provide a 'url' query parameter." });
  }

  try {
    const result = await extractMedia(targetUrl);
    if (result) {
      res.json(result);
    } else {
      res.status(500).json({ error: "Failed to extract media from the provided URL." });
    }
  } catch (error) {
    res.status(500).json({ error: "An unexpected error occurred during scraping.", details: error.message });
  }
});

// Basic root route
app.get("/", (req, res) => {
  res.send("Welcome to the Web Scraper API. Use /scrape?url=YOUR_URL to extract media.");
});

app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`));