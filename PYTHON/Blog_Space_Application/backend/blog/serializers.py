from rest_framework import serializers
from .models import Post, Comment
from accounts.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments"""
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for post list view"""
    author = UserSerializer(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author',
            'featured_image', 'comment_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer for post detail view"""
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content',
            'author', 'featured_image', 'published',
            'comments', 'comment_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'author', 'created_at', 'updated_at']


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating posts"""
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'excerpt', 'content',
            'featured_image', 'published'
        ]
        read_only_fields = ['id']
    
    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters long"
            )
        return value
    
    def validate_excerpt(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                "Excerpt must be at least 10 characters long"
            )
        return value
    
    def validate_content(self, value):
        if len(value) < 50:
            raise serializers.ValidationError(
                "Content must be at least 50 characters long"
            )
        return value


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = Comment
        fields = ['id', 'content']
        read_only_fields = ['id']
    
    def validate_content(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Comment must be at least 3 characters long"
            )
        return value