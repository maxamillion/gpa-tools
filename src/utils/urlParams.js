/**
 * URL Parameter Utilities
 * Handles encoding/decoding evaluation data for sharing
 */

export function parseRepoFromUrl(url) {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL');
    }

    const pathParts = urlObj.pathname.split('/').filter((p) => p);

    if (pathParts.length < 2) {
      throw new Error('URL must contain owner and repository name');
    }

    const [owner, name] = pathParts;
    return { owner, name };
  } catch (error) {
    throw new Error(`Invalid GitHub repository URL: ${error.message}`);
  }
}

export function encodeEvaluation({ owner, name }) {
  const params = new URLSearchParams();
  params.set('repo', `${owner}/${name}`);
  return params;
}

export function decodeEvaluation(params) {
  const repo = params.get('repo');

  if (!repo) {
    return null;
  }

  const parts = repo.split('/');
  if (parts.length !== 2) {
    return null;
  }

  const [owner, name] = parts;
  return { owner, name };
}
