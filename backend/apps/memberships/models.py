from django.db import models


class Membership(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    benefits = models.TextField()

    def __str__(self):
        return self.name
    