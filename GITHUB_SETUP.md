# GitHub Pages Setup Guide

## Step-by-Step Instructions

### Step 1: Fix Command Line Tools (if you saw an error)
If you got an error about Command Line Tools, run:
```bash
xcode-select --install
```

### Step 2: Create GitHub Repository
1. Go to https://github.com and sign in (or create account)
2. Click the **+** icon in top right → **New repository**
3. Repository name: `wikipedia-educational` (or any name you like)
4. Make it **Public** (required for free GitHub Pages)
5. **DO NOT** check "Initialize with README"
6. Click **Create repository**

### Step 3: Initialize Git (run these commands in terminal)

```bash
# Make sure you're in the project folder
cd ~/wikipedia-educational

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Wikipedia educational website"

# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/wikipedia-educational.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### Step 5: Access Your Website
Your website will be available at:
```
https://YOUR_USERNAME.github.io/wikipedia-educational/
```

**Note:** It may take a few minutes for the site to go live (usually 1-2 minutes).

### Step 6: Share with Friends!
Send them the URL: `https://YOUR_USERNAME.github.io/wikipedia-educational/`

---

## Troubleshooting

**If you get authentication errors:**
- You might need to use a Personal Access Token instead of password
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate a new token with `repo` permissions
- Use the token as your password when pushing

**If the site doesn't load:**
- Make sure your repository is **Public**
- Make sure you have an `index.html` file in the root
- Wait a few minutes and refresh

**If you need to update the website:**
```bash
git add .
git commit -m "Update website"
git push
```
Changes will be live in 1-2 minutes after pushing!

