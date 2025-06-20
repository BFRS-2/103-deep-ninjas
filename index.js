const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Example endpoint that proxies a request to another API
// app.get('/proxy', async (req, res) => {
//   try {
//     // Replace this URL with the actual API you want to call
//     const apiUrl = 'https://api.publicapis.org/entries';
//     const response = await axios.get(apiUrl);
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch data from external API', details: error.message });
//   }
// });

app.post('/generate-ad-copy', async (req, res) => {
  const {
    website_url,
    brandIdeology,
    productPageDescription,
    pricePoint,
    category,
    productReviews,
    offerAvailable,
    productImages,
    additional_input
  } = req.body;

  // Require website_url and productImages only
  if (!website_url || !productImages) {
    return res.status(400).json({ error: 'website_url and productImages are required.' });
  }

  let extracted = {};
  try {
    // Fetch HTML from the target URL
    const response = await axios.get(website_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const html = response.data;
    const trimmedHtml = html.slice(0, 8000);
    // Build the prompt for ChatGPT
    const extractPrompt = `You are a web content parser. Analyze the following raw HTML from a product or brand webpage and extract the required details. Return only the completed JSON object below—no explanations or extra formatting.

{
  "brandDetails": "", 
  "ProductDescription": "", 
  "pricePoint": "", 
  "brandCategory": "", 
  "customerReviews": "", 
  "currentOffers": ""
}

Field definitions:
- brandDetails: A short summary of the brand's mission, values, or positioning as found in the HTML.
- ProductDescription: Key product features or descriptions visible on the page.
- pricePoint: Product price, including any discount or offer shown, with currency.
- brandCategory: General category of the product (e.g., clothing, electronics, beauty).
- customerReviews: A brief overview of reviews, ratings, or customer sentiment if available.
- currentOffers: Any active deals, promotions, or discounts listed on the page.

HTML content:
"""
${trimmedHtml}
"""`;
    // Call the OpenAI ChatGPT API
    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: extractPrompt }],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'Cookie': '_cfuvid=1d8bw.CZgYAvenWIeThEtEDoNi.NZ_exn6yyJ38kH2Q-1750234281475-0.0.1.1-604800000'
        }
      }
    );
    const content = openaiRes.data.choices[0].message.content;
    try {
      extracted = JSON.parse(content);
    } catch (err) {
      extracted = {};
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch or process the website', details: err.message });
  }

  // Use extracted fields as fallback if explicit input is not provided
  const finalBrandIdeology = brandIdeology || extracted.brandDetails || '';
  const finalProductPageDescription = productPageDescription || extracted.ProductDescription || '';
  const finalPricePoint = pricePoint || extracted.pricePoint || '';
  const finalCategory = category || extracted.brandCategory || '';
  const finalProductReviews = productReviews || extracted.customerReviews || '';
  const finalOfferAvailable = offerAvailable || extracted.currentOffers || '';
  // productImages and additional_input are not extracted from website, so use as is

  const additionalInfo = additional_input ? additional_input : 'not available';

  const prompt = `I want you to act as a marketing agency which runs advertisements on meta for various ecommerce brands. I will provide you the following details brand ideology, product page description, price point, category, product reviews, offer available and product images. I want you to generate the properly structured following ad copy elements Headline (This is the primary message or hook of the ad. It should grab attention quickly and convey the value proposition. It should include the brand name), Primary Text/Ad Description (This is the longer part of the ad copy, providing more details about the product, its benefits, or special offers), Call-to-Action (This is a directive to the viewer, encouraging them to take the next step), Hashtags (Use relevant hashtags to increase the reach of your ad. These should be product-related or industry-specific).Brand ideology - ${finalBrandIdeology} Product Page Description - ${finalProductPageDescription} Price Point  - - - ${finalPricePoint} Product Category - ${finalCategory} Product Reviews - ${finalProductReviews} Offers available - ${finalOfferAvailable} product images - [${productImages.join(', ')}] addtional information - ${additionalInfo} Structure the entire output in the following json format. Provide only this json as the output and ensure that the json is complete and well formed. Generate atleast 10-15 outputs. [{"heading" : "value","primary text" : "value","call_to_action" : "value","hashtags" : "value"}]`;
  console.log(prompt);
  try {
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 5000
      },
      {
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        }
      }
    );
    // Parse the content key in the message object in the 0th index of choices array as JSON
    let parsed;
    try {
      parsed = JSON.parse(openaiResponse.data.choices[0].message.content);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse OpenAI response as JSON', details: e.message, raw: openaiResponse.data.choices[0].message.content });
    }
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate ad copy', details: error.response?.data || error.message });
  }
});

app.post('/website', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Step 1: Fetch HTML from the target URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0' // Helps bypass bot detection
      }
    });

    const html = response.data;
    const trimmedHtml = html.slice(0, 8000); // Limit size to stay within token limits

    // Step 2: Build the prompt for ChatGPT
    const prompt = `You are a web content parser. Analyze the following raw HTML from a product or brand webpage and extract the required details. Return only the completed JSON object below—no explanations or extra formatting.

{
  "brandDetails": "", 
  "ProductDescription": "", 
  "pricePoint": "", 
  "brandCategory": "", 
  "customerReviews": "", 
  "currentOffers": ""
}

Field definitions:
- brandDetails: A short summary of the brand's mission, values, or positioning as found in the HTML.
- ProductDescription: Key product features or descriptions visible on the page.
- pricePoint: Product price, including any discount or offer shown, with currency.
- brandCategory: General category of the product (e.g., clothing, electronics, beauty).
- customerReviews: A brief overview of reviews, ratings, or customer sentiment if available.
- currentOffers: Any active deals, promotions, or discounts listed on the page.

HTML content:
"""
${trimmedHtml}
"""`;

    // Step 3: Call the OpenAI ChatGPT API
    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'Cookie': '_cfuvid=1d8bw.CZgYAvenWIeThEtEDoNi.NZ_exn6yyJ38kH2Q-1750234281475-0.0.1.1-604800000'
        }
      }
    );

    const content = openaiRes.data.choices[0].message.content;

    // Step 4: Try parsing GPT output as JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      parsed = {
        raw: content,
        warning: 'GPT output could not be parsed as JSON'
      };
    }

    return res.json(parsed);

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch or process the webpage' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 