#!/bin/bash

# Create build directory if it doesn't exist
mkdir -p build/temp

# Package BP and RP into temp directory
zip -rq build/temp/BP.zip BP/*
zip -rq build/temp/RP.zip RP/*

# Combine into final .mcpack
if [ -f build/build.mcpack ]; then
    mv build/build.mcpack build/oldBuild.mcpack
    echo "ℹ️ Renamed existing build.mcpack to oldBuild.mcpack"
fi

cd build/temp && zip -rq ../build.mcpack * && cd ../..
echo "✅ Successfully created build.mcpack"

# Cleanup temp files
rm -rf build/temp
echo "🧹 Cleaned up temporary files"