import { CreateCourseData } from '../types/course';

export function generateCoursePrompt(
  data: CreateCourseData,
  topicIndex: number
): string {
  const isCurrentTopic = topicIndex === 0;

  return `
      Generate the structure for one topic in the course titled "${data.title}".
      The course description is: "${data.description}".
      Course type: "${data.type}".
      This is topic ${topicIndex + 1} of ${data.numTopics}.
      
      Format the response as a JSON object using this structure:
      {
        "topic": {
          "title": "Topic Title",
          ${isCurrentTopic
      ? '"theory": "Detailed content explaining the topic, including relevant context and examples.",'
      : '"theory": "",'
    }
          "subtopics": [
            {
              "title": "Subtopic Title",
              ${isCurrentTopic
      ? '"theory": "Detailed content explaining the subtopic, including examples.",'
      : '"theory": "",'
    }
              "youtube": "",
              "image": "",
              "done": ${isCurrentTopic ? 'true' : 'false'}
            }
          ]
        }
      }
  
      Requirements:
      - Generate a topic relevant to the course description.
      - Include subtopics that are logically related to this topic.
      - ${isCurrentTopic
      ? 'Provide detailed content in the "theory" field for the topic and its subtopics, including relevant examples.'
      : 'Leave the "theory" field empty for the topic and subtopics.'
    }
      - Ensure the explanations are concise, clear, and educational.
      - Keep the "youtube" and "image" fields empty.
      - If there is code, please put the code in an HTML code tag but strictly do not include any other HTML tags.
      - Set the "done" field to ${isCurrentTopic ? 'true' : 'false'
    } for all subtopics.
  
      ${data.subtopics?.length
      ? `Additional Requirement:
      - Include references to these subtopics if relevant: ${data.subtopics
        .map((subtopic) => `"${subtopic}"`)
        .join(', ')}.`
      : ''
    }
    `.trim();
}

export function generatePreviewPrompt(data: CreateCourseData): string {
  const subtopicsList = data.subtopics?.length
    ? data.subtopics.join(', ')
    : 'none';

  return `
      Generate a preview with ${data.numTopics
    } unique topics, each containing subtopics related to the course "${data.title
    }".
      The course is about: ${data.description}.
      
      Format the response as a JSON object with this structure:
      {
        "${data.title.toLowerCase()}": [
          {
            "title": "Sample Topic Title",
            "subtopics": [
              {
                "title": "Sample Subtopic Title",
                "theory": "",
                "youtube": "",
                "image": "",
                "done": false
              }
            ]
          }
        ]
      }

      Requirements:
      - Generate ${data.numTopics
    } unique topics relevant to the course description.
      - Each topic should contain diverse subtopics relevant to the topic itself.
      - Include the following subtopics somewhere across all topics: ${subtopicsList}.
      - Keep all media fields (theory, youtube, image) empty.
      - Ensure the content structure is suitable for the ${data.type} format.
      - Ensure if is threre code please put the code in html code tag but strictly do not include any other html tag
      - Set "done" to false for all subtopics.
    `;
}

export function generateSubtopicDetailsPrompt(
  mainTopic: string,
  subTopic: string
): string {
  return `
      Explain the subtopic "${subTopic}" in the context of the main topic "${mainTopic}".
      Provide detailed explanations, including practical examples and key points.
      Do not include additional resources or images in the response.
      Format the response as plain text.
    `.trim();
}

export function generateSubtopicContentPrompt(
  mainTopic: string,
  subTopic: string
): string {
  return `
      Explain the subtopic "${subTopic}" in detail within the context of the main topic "${mainTopic}".
      Include:
      - Clear and concise definitions.
      - Practical examples or use cases.
      - Logical explanations that build on the main topic.
      
      Format the response as JSON:
      {
        "title": "${subTopic}",
        "content": "Generated detailed explanation for the subtopic."
      }
      
      Requirements:
      - The explanation must be educational and easy to understand.
      - Ensure if is threre code please put the code in html code tag but strictly do not include any other html tag
      - Avoid adding links, images, or unrelated content.
    `.trim();
}

export function generateTopicContentPrompt(mainTopic: string): string {
  return `
      Generate a detailed educational explanation for the main topic "${mainTopic}".
      
      Include:
      - A clear introduction to the topic.
      - Detailed explanations of the key concepts and ideas.
      - Practical examples or use cases.
      - Logical progression of ideas, starting from basics to advanced concepts.
      
      Format the response as JSON:
      {
        "title": "${mainTopic}",
        "content": "Generated detailed explanation for the topic."
      }
      
      Requirements:
      - The explanation must be thorough, educational, and easy to understand.
      - If there is any code, please include it within HTML <code> tags, but strictly avoid using other HTML tags.
      - Avoid adding links, images, or unrelated content.
    `.trim();
}

export function generateTextPromptForImage(
  topic: string,
  courseTitle: string
): string {
  return `
      Generate a visual description for the topic '${topic}' within the course '${courseTitle}'.
      The description should be concise, engaging, and highlight the key visual elements that reflect the topic. 
      Format the response in 150 characters or fewer.
  `.trim();
}

export function generatePromptForDescription(description: string): string {
  return `
    Expand the following course description into a detailed and engaging summary of around 300 characters:
    "${description}"
    Ensure the description remains clear, concise, and educational while highlighting the core objectives and value of the course.
  `.trim();
}

export function generatePromptForImages(courseTitle: string): string {
  return `
    Generate a visual description for the course titled '${courseTitle}'.
    The description should highlight the course theme, educational value, and engaging visual elements. 
    Format the response in 150 characters or fewer.
  `.trim();
}