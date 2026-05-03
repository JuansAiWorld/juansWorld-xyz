# 🚀 FlowPace Version Management - Quick Start

## ⚡ One-Command Build Number Increment

```bash
# From project root directory
make increment-build
```

## 📱 What You Get

✅ **Automatic build number management** - Never forget to increment again!  
✅ **Version number management** - Easy version updates  
✅ **Multiple ways to use** - Scripts, Makefile, or Xcode integration  
✅ **Safe and verified** - All changes are verified before completion  

## 🎯 Daily Workflow

### Before Each Build
```bash
make increment-build
```

### Then Build Normally
```bash
make build
# or use Xcode normally
```

## 🔧 Available Commands

| Command | What It Does |
|---------|--------------|
| `make increment-build` | Increment build number |
| `make show-version` | Show current version & build |
| `make increment-version` | Increment version number |
| `make build` | Build the project |
| `make quick-build` | Increment + build in one command |

## 🚨 Important Notes

- **Always run from project root** (where `Makefile` is located)
- **Build numbers auto-increment** - no manual editing needed
- **Version numbers** can be updated manually when needed
- **All changes are verified** before completion

## 🆘 Need Help?

```bash
make help                    # Show all available commands
./FlowPace/scripts/version_manager.sh help  # Script help
```

## 🎉 You're All Set!

Your FlowPace project now has automatic build number management. Just run `make increment-build` before each build and you'll never have outdated build numbers again!
